import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, '../..');

await esbuild.build({
  entryPoints: ['index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/index.js',
  external: ['@aws-sdk/*', 'mjml', 'mjml-*'],
  alias: {
    server: path.join(srcDir, 'server'),
    shared: path.join(srcDir, 'shared'),
  },
});
