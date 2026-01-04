import { defineConfig } from '@farmfe/core';
import farmPostcss from '@farmfe/js-plugin-postcss';
import electron from '@farmfe/js-plugin-electron';
import path from 'path';

export default defineConfig({
  root: path.resolve(process.cwd(), 'src/renderer'),
  compilation: {
    persistentCache: false,
    output: {
      path: '../../dist',
      publicPath: './',
      assetsFilename: 'assets/[resourceName].[contentHash].[ext]',
    },
  },
  publicDir: 'public',
  server: {
    port: 5173,
    hmr: true,
  },
  plugins: [
    '@farmfe/plugin-react',
    farmPostcss(),
    electron({
      main: {
        input: 'src/main/main.ts',
        farm: {
          compilation: {
            external: [
              'electron-liquid-glass',
              'adm-zip',
              '@modelcontextprotocol/sdk',
              '@modelcontextprotocol/sdk/client/index.js',
              '@modelcontextprotocol/sdk/client/stdio.js',
              '@modelcontextprotocol/sdk/types.js',
              'smol-toml',
            ],
          },
        },
      },
      preload: {
        input: 'src/main/preload.ts',
      },
    }),
  ],
});
