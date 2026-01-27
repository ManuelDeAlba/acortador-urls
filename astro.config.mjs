// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify(),
  vite: {
    plugins: [tailwindcss()],
  },

  env: {
    schema: {
      JWT_SECRET: envField.string({ context: "server", access:"secret", default: 'misecretojwt' }),
    }
  },
});