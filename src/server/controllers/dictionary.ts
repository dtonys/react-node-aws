import express, { Request, Response } from 'express';
import { Client } from '@opensearch-project/opensearch';

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

    res.json({ success: true, result: result.body });
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

      type HitResult = { _id: string; _source: DictionaryEntry; _score: number };
      const hits = (result.body.hits.hits as unknown as HitResult[]).map((hit) => ({
        id: hit._id,
        ...hit._source,
        score: hit._score,
      }));

      const total = result.body.hits.total;
      res.json({
        total: typeof total === 'number' ? total : (total?.value ?? 0),
        hits,
      });
    } catch (error) {
      console.error('Error searching:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  };

  // Index a single dictionary entry
  static indexEntry = async (req: Request, res: Response) => {
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
    res.json({ success: true, result: result.body });
  };

  // Bulk index dictionary entries
  static bulkIndex = async (req: Request, res: Response) => {
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

    type BulkItem = { index?: { error?: unknown } };
    const items = result.body.items as unknown as BulkItem[];
    res.json({
      success: !result.body.errors,
      indexed: entries.length,
      errors: result.body.errors ? items.filter((item) => item.index?.error) : [],
    });
  };

  // Delete a dictionary entry
  static deleteEntry = async (req: Request, res: Response) => {
    const { word } = req.params;

    const result = await this.client.delete({
      index: INDEX_NAME,
      id: word.toLowerCase(),
      refresh: true,
    });

    res.json({ success: true, result: result.body });
  };
}

export default DictionaryController;
