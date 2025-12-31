import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginN from 'eslint-plugin-n';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['eslint.config.mts'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  ...tseslint.configs.recommendedTypeChecked.map((config: any) => ({
    ...config,
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions!.parserOptions,
        project: ['./src/server/tsconfig.json', './src/client/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  })),
  {
    files: ['**/*.{ts,mts,cts,tsx}'],
    // Ignore unused variables starting with an underscore
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  pluginReact.configs.flat.recommended,
  {
    // React 17+ with new JSX transform doesn't require React in scope
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
  // Inject Node.js rules into the backend
  {
    files: ['src/server/**/*.{js,mjs,cjs,ts,mts,cts}'],
    ...pluginN.configs['flat/recommended-script'],
    rules: {
      'n/no-missing-import': 'off', // TypeScript handles import resolution
    },
  },
  prettierConfig,
]);
