import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { cyan } from 'server/helpers/console';

// Create OpenSearch client with AWS Signature v4 authentication
export function createOpenSearchClient(): Client {
  const endpoint = process.env.OPENSEARCH_ENDPOINT;
  if (!endpoint) {
    throw new Error('OPENSEARCH_ENDPOINT environment variable is not set');
  }

  // When using SSH tunnel (localhost), skip SSL verification since the cert
  // is for the VPC endpoint domain, not localhost
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

// Development logger for OpenSearch operations
export function logOpenSearchOperation(operation: string, body: unknown, result?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.log(cyan, `OpenSearch: ${operation}`);
    console.log(cyan, JSON.stringify(body, null, 2));
    if (result) {
      console.log(cyan, `${operation} =>`);
      console.log(cyan, JSON.stringify(result, null, 2));
    }
    console.log('');
  }
}
