import express, { Request, Response } from 'express';
import { Client } from '@opensearch-project/opensearch';
import { logOpenSearchOperation } from 'server/helpers/opensearch';

const INDEX_NAME = 'dictionary';

type DictionaryControllerConfig = {
  opensearchClient: Client;
};

type DictionaryEntry = {
  word: string;
  definition: string;
  partOfSpeech?: string;
  example?: string;
};

class DictionaryController {
  private static client: Client;

  static init({ opensearchClient }: DictionaryControllerConfig) {
    console.log('Initializing dictionary controller...');
    this.client = opensearchClient;
    const router = express.Router();
    router.get('/dictionary/search', this.search);
    router.post('/dictionary/index', this.indexEntry);
    router.post('/dictionary/bulk', this.bulkIndex);
    router.delete('/dictionary/:word', this.deleteEntry);
    router.post('/dictionary/create-index', this.createIndex);
    return router;
  }

  // Create the dictionary index with appropriate mappings
  static createIndex = async (_req: Request, res: Response) => {
    console.log('Creating index...');
    try {
      const indexExists = await this.client.indices.exists({ index: INDEX_NAME });
      console.log('Index exists:', indexExists.body);
      if (indexExists.body) {
        res.status(400).json({ error: 'Index already exists' });
        return;
      }
      console.log('Index does not exist, creating...');
      const result = await this.client.indices.create({
        index: INDEX_NAME,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                // Custom analyzer for dictionary lookups
                dictionary_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding'],
                },
              },
            },
          },
          mappings: {
            properties: {
              word: {
                type: 'text',
                analyzer: 'dictionary_analyzer',
                fields: {
                  // Exact match field for precise lookups
                  keyword: { type: 'keyword' },
                  // Autocomplete field
                  autocomplete: {
                    type: 'text',
                    analyzer: 'dictionary_analyzer',
                  },
                },
              },
              definition: {
                type: 'text',
                analyzer: 'dictionary_analyzer',
              },
              partOfSpeech: {
                type: 'keyword',
              },
              example: {
                type: 'text',
                analyzer: 'dictionary_analyzer',
              },
            },
          },
        },
      });

      logOpenSearchOperation('createIndex', { index: INDEX_NAME }, result.body);
      res.json({ success: true, result: result.body });
    } catch (error) {
      console.error('Error creating index:', error);
      res.status(500).json({ error: 'Failed to create index' });
    }
  };

  // Search for dictionary entries
  static search = async (req: Request, res: Response) => {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({ error: 'Query parameter "q" is required' });
        return;
      }

      const result = await this.client.search({
        index: INDEX_NAME,
        body: {
          size: Number(limit),
          query: {
            multi_match: {
              query: q,
              fields: ['word^3', 'word.autocomplete^2', 'definition'],
              type: 'best_fields',
              fuzziness: 'AUTO',
            },
          },
          highlight: {
            fields: {
              word: {},
              definition: {},
            },
          },
        },
      });

      logOpenSearchOperation('search', { query: q }, result.body);

      const hits = result.body.hits.hits.map(
        (hit: { _id: string; _source: DictionaryEntry; _score: number }) => ({
          id: hit._id,
          ...hit._source,
          score: hit._score,
        }),
      );

      res.json({
        total: result.body.hits.total.value,
        hits,
      });
    } catch (error) {
      console.error('Error searching:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  };

  // Index a single dictionary entry
  static indexEntry = async (req: Request, res: Response) => {
    try {
      const entry: DictionaryEntry = req.body;

      if (!entry.word || !entry.definition) {
        res.status(400).json({ error: 'word and definition are required' });
        return;
      }

      const result = await this.client.index({
        index: INDEX_NAME,
        id: entry.word.toLowerCase(),
        body: entry,
        refresh: true,
      });

      logOpenSearchOperation('indexEntry', entry, result.body);
      res.json({ success: true, result: result.body });
    } catch (error) {
      console.error('Error indexing entry:', error);
      res.status(500).json({ error: 'Failed to index entry' });
    }
  };

  // Bulk index dictionary entries
  static bulkIndex = async (req: Request, res: Response) => {
    try {
      const entries: DictionaryEntry[] = req.body.entries;

      if (!Array.isArray(entries) || entries.length === 0) {
        res.status(400).json({ error: 'entries array is required' });
        return;
      }

      // Build bulk request body
      const bulkBody = entries.flatMap((entry) => [
        { index: { _index: INDEX_NAME, _id: entry.word.toLowerCase() } },
        entry,
      ]);

      const result = await this.client.bulk({
        body: bulkBody,
        refresh: true,
      });

      logOpenSearchOperation('bulkIndex', { count: entries.length }, result.body);

      res.json({
        success: !result.body.errors,
        indexed: entries.length,
        errors: result.body.errors
          ? result.body.items.filter((item: { index: { error?: unknown } }) => item.index.error)
          : [],
      });
    } catch (error) {
      console.error('Error bulk indexing:', error);
      res.status(500).json({ error: 'Bulk indexing failed' });
    }
  };

  // Delete a dictionary entry
  static deleteEntry = async (req: Request, res: Response) => {
    try {
      const { word } = req.params;

      const result = await this.client.delete({
        index: INDEX_NAME,
        id: word.toLowerCase(),
        refresh: true,
      });

      logOpenSearchOperation('deleteEntry', { word }, result.body);
      res.json({ success: true, result: result.body });
    } catch (error) {
      console.error('Error deleting entry:', error);
      res.status(500).json({ error: 'Failed to delete entry' });
    }
  };
}

export default DictionaryController;
