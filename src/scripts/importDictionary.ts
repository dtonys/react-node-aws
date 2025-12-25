import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const INDEX_NAME = 'dictionary2';
const BATCH_SIZE = 1000;

type DictionaryEntry = {
  word: string;
  wordType: string;
  definition: string;
};

function createOpenSearchClient(): Client {
  const endpoint = process.env.OPENSEARCH_ENDPOINT;
  if (!endpoint) {
    throw new Error('OPENSEARCH_ENDPOINT environment variable is not set');
  }

  const isLocalTunnel = endpoint.includes('localhost') || endpoint.includes('127.0.0.1');

  const client = new Client({
    ...AwsSigv4Signer({
      region: process.env.AWS_REGION || 'us-west-1',
      service: 'es',
      getCredentials: () => {
        const credentialsProvider = defaultProvider();
        return credentialsProvider();
      },
    }),
    node: endpoint,
    ssl: isLocalTunnel ? { rejectUnauthorized: false } : undefined,
  });

  return client;
}

async function createIndex(client: Client): Promise<void> {
  const indexExists = await client.indices.exists({ index: INDEX_NAME });

  if (indexExists.body) {
    console.log(`Index "${INDEX_NAME}" already exists. Deleting...`);
    await client.indices.delete({ index: INDEX_NAME });
  }

  console.log(`Creating index "${INDEX_NAME}"...`);
  await client.indices.create({
    index: INDEX_NAME,
    body: {
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
        analysis: {
          analyzer: {
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
              keyword: { type: 'keyword' },
              autocomplete: {
                type: 'text',
                analyzer: 'dictionary_analyzer',
              },
            },
          },
          wordType: {
            type: 'keyword',
          },
          definition: {
            type: 'text',
            analyzer: 'dictionary_analyzer',
          },
        },
      },
    },
  });

  console.log('Index created successfully.');
}

async function* parseCSV(filePath: string): AsyncGenerator<DictionaryEntry> {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let currentEntry: DictionaryEntry | null = null;
  let isFirstLine = true;

  for await (const line of rl) {
    // Skip header
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }

    // Check if this is a new entry (starts with a word) or continuation
    // New entries start with a word followed by comma
    // Continuation lines start with whitespace
    if (line.match(/^[a-zA-Z0-9\-']/)) {
      // This is a new entry - yield the previous one if exists
      if (currentEntry) {
        // Clean up the definition (remove extra whitespace)
        currentEntry.definition = currentEntry.definition.replace(/\s+/g, ' ').trim();
        yield currentEntry;
      }

      // Parse the new entry
      // CSV format: word,wordtype,definition
      // Use a simple CSV parse approach that handles quoted fields
      const match = line.match(/^([^,]*),([^,]*),(.*)$/);
      if (match) {
        const [, word, wordType, definition] = match;
        currentEntry = {
          word: word.trim().replace(/^"|"$/g, ''),
          wordType: wordType.trim().replace(/^"|"$/g, ''),
          definition: definition.trim().replace(/^"|"$/g, ''),
        };
      }
    } else if (currentEntry) {
      // Continuation of previous definition
      currentEntry.definition += ' ' + line.trim();
    }
  }

  // Yield the last entry
  if (currentEntry) {
    currentEntry.definition = currentEntry.definition.replace(/\s+/g, ' ').trim();
    yield currentEntry;
  }
}

async function bulkIndex(client: Client, entries: DictionaryEntry[]): Promise<number> {
  if (entries.length === 0) return 0;

  const bulkBody = entries.flatMap((entry) => [
    {
      index: { _index: INDEX_NAME, _id: `${entry.word.toLowerCase()}-${entry.wordType || 'none'}` },
    },
    entry,
  ]);

  const result = await client.bulk({
    body: bulkBody,
    refresh: false,
  });

  if (result.body.errors) {
    type BulkItem = { index?: { error?: { reason?: string } } };
    const errors = (result.body.items as BulkItem[])
      .filter((item) => Boolean(item.index?.error))
      .slice(0, 5);
    console.error('Some bulk indexing errors:', JSON.stringify(errors, null, 2));
  }

  return entries.length;
}

async function main(): Promise<void> {
  console.log('Running importDictionary.ts...');
  const csvPath = path.resolve(__dirname, '../../data/dictionary.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`Dictionary file not found: ${csvPath}`);
    console.error('Please download it first:');
    console.error(
      'curl -o data/dictionary.csv "https://raw.githubusercontent.com/CloudBytes-Academy/English-Dictionary-Open-Source/main/csv/dictionary.csv"',
    );
    process.exit(1);
  }

  console.log('Connecting to OpenSearch...');
  const client = createOpenSearchClient();

  // Test connection
  try {
    const info = await client.info();
    console.log('Connected to OpenSearch:', info.body.version.number);
  } catch (error) {
    console.error('Failed to connect to OpenSearch:', error);
    process.exit(1);
  }

  // Create the index
  await createIndex(client);

  // Parse and index the dictionary
  console.log(`Parsing and indexing dictionary from ${csvPath}...`);

  let batch: DictionaryEntry[] = [];
  let totalIndexed = 0;
  const startTime = Date.now();

  for await (const entry of parseCSV(csvPath)) {
    batch.push(entry);

    if (batch.length >= BATCH_SIZE) {
      const indexed = await bulkIndex(client, batch);
      totalIndexed += indexed;
      console.log(`Indexed ${totalIndexed} entries...`);
      batch = [];
    }
  }

  // Index remaining entries
  if (batch.length > 0) {
    const indexed = await bulkIndex(client, batch);
    totalIndexed += indexed;
  }

  // Refresh the index to make all documents searchable
  await client.indices.refresh({ index: INDEX_NAME });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\nImport complete!`);
  console.log(`Total entries indexed: ${totalIndexed}`);
  console.log(`Time elapsed: ${duration}s`);

  // Show some stats
  const stats = await client.count({ index: INDEX_NAME });
  console.log(`Documents in index: ${stats.body.count}`);
}

main().catch(console.error);
