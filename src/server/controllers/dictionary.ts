import express, { Request, Response } from 'express';
import { Client } from '@opensearch-project/opensearch';
import AuthController from './auth';

const INDEX_NAME = 'dictionary';
const INDEX_NAME_V2 = 'dictionary2';

type DictionaryControllerConfig = {
  opensearchClient: Client;
};

type DictionaryEntry = {
  word: string;
  definition: string;
  wordType?: string;
};

class DictionaryController {
  private static client: Client;

  static init({ opensearchClient }: DictionaryControllerConfig) {
    console.log('Initializing dictionary controller...');
    this.client = opensearchClient;
    const router = express.Router();

    // v1 endpoints (legacy)
    router.get('/dictionary/search', this.search);
    router.post('/dictionary/index', this.indexEntry);
    router.post('/dictionary/bulk', this.bulkIndex);
    router.delete('/dictionary/:word', this.deleteEntry);
    router.post('/dictionary/create-index', this.createIndex);

    // v2 endpoints (auth required)
    router.use('/v2/dictionary', AuthController.authMiddleware);
    router.get('/v2/dictionary/word/:word', this.getWordV2);
    router.get('/v2/dictionary/search', this.searchV2);
    router.get('/v2/dictionary/autocomplete', this.autocompleteV2);
    router.get('/v2/dictionary/random', this.randomWordV2);

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
            wordType: {
              type: 'keyword',
            },
          },
        },
      },
    });

    res.json({ success: true, result: result.body });
  };

  // Search for dictionary entries
  static search = async (req: Request, res: Response) => {
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

  // ============================================
  // V2 ENDPOINTS
  // ============================================

  // Get all definitions for a specific word (exact match)
  static getWordV2 = async (req: Request, res: Response) => {
    const { word } = req.params;

    const result = await this.client.search({
      index: INDEX_NAME_V2,
      body: {
        query: {
          term: {
            'word.keyword': word.toLowerCase(),
          },
        },
      },
    });

    type HitResult = { _id: string; _source: DictionaryEntry };
    const hits = result.body.hits.hits as unknown as HitResult[];

    if (hits.length === 0) {
      res.status(404).json({ error: 'Word not found' });
      return;
    }

    // Group definitions by wordType
    const definitions = hits.map((hit) => ({
      wordType: hit._source.wordType || null,
      definition: hit._source.definition,
    }));

    res.json({
      word: hits[0]._source.word,
      definitions,
    });
  };

  // V2 Search with more options
  static searchV2 = async (req: Request, res: Response) => {
    const { q, field = 'all', wordType, limit = 10, offset = 0 } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }

    // Build query based on field parameter
    type QueryType = {
      bool: {
        must: object[];
        filter?: object[];
      };
    };

    const query: QueryType = {
      bool: {
        must: [],
        filter: [],
      },
    };

    // Add search query based on field
    if (field === 'word') {
      query.bool.must.push({
        match: {
          word: {
            query: q,
            fuzziness: 'AUTO',
          },
        },
      });
    } else if (field === 'definition') {
      query.bool.must.push({
        match: {
          definition: {
            query: q,
            fuzziness: 'AUTO',
          },
        },
      });
    } else {
      // Search both word and definition
      query.bool.must.push({
        multi_match: {
          query: q,
          fields: ['word^3', 'definition'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Filter by wordType if provided
    if (wordType && typeof wordType === 'string') {
      query.bool.filter?.push({
        term: { wordType: wordType },
      });
    }

    const result = await this.client.search({
      index: INDEX_NAME_V2,
      body: {
        from: Number(offset),
        size: Number(limit),
        query,
        highlight: {
          fields: {
            word: {},
            definition: { fragment_size: 150, number_of_fragments: 3 },
          },
          pre_tags: ['<mark>'],
          post_tags: ['</mark>'],
        },
      },
    });

    type HitResult = {
      _id: string;
      _source: DictionaryEntry;
      _score: number;
      highlight?: { word?: string[]; definition?: string[] };
    };
    const hits = (result.body.hits.hits as unknown as HitResult[]).map((hit) => ({
      id: hit._id,
      word: hit._source.word,
      wordType: hit._source.wordType || null,
      definition: hit._source.definition,
      score: hit._score,
      highlight: hit.highlight || null,
    }));

    const total = result.body.hits.total;
    res.json({
      total: typeof total === 'number' ? total : (total?.value ?? 0),
      offset: Number(offset),
      limit: Number(limit),
      hits,
    });
  };

  // Autocomplete for words (prefix matching)
  static autocompleteV2 = async (req: Request, res: Response) => {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }

    const result = await this.client.search({
      index: INDEX_NAME_V2,
      body: {
        size: Number(limit),
        query: {
          bool: {
            should: [
              // Exact prefix match (highest priority)
              {
                prefix: {
                  'word.keyword': {
                    value: q.toLowerCase(),
                    boost: 3,
                  },
                },
              },
              // Fuzzy match for typos
              {
                match: {
                  word: {
                    query: q,
                    fuzziness: 'AUTO',
                    prefix_length: 1,
                  },
                },
              },
            ],
          },
        },
        // Collapse by word to avoid duplicate words with different wordTypes
        collapse: {
          field: 'word.keyword',
        },
        _source: ['word'],
      },
    });

    type HitResult = { _source: { word: string } };
    const suggestions = (result.body.hits.hits as unknown as HitResult[]).map(
      (hit) => hit._source.word,
    );

    res.json({ suggestions });
  };

  // Get a random word
  static randomWordV2 = async (_req: Request, res: Response) => {
    // @ts-expect-error random_score is valid but not in OpenSearch types
    const result = await this.client.search({
      index: INDEX_NAME_V2,
      body: {
        size: 1,
        query: {
          function_score: {
            query: { match_all: {} },
            random_score: {},
          },
        },
      },
    });

    type HitResult = { _source: DictionaryEntry };
    const hits = result.body.hits.hits as unknown as HitResult[];

    if (hits.length === 0) {
      res.status(404).json({ error: 'No words found' });
      return;
    }

    const entry = hits[0]._source;
    res.json({
      word: entry.word,
      wordType: entry.wordType || null,
      definition: entry.definition,
    });
  };
}

export default DictionaryController;
