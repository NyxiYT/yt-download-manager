// The website of YT Download Manager, published on GitHub Pages at /yt-download-manager/.
// Pictures come from ../docs/images (the README uses the same files); Astro makes AVIF and WebP versions.
import { cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const images = new URL('../docs/images/', import.meta.url);


export default defineConfig({
  site: 'https://nyxiyt.github.io',
  base: '/yt-download-manager/',
  trailingSlash: 'ignore',
  integrations: [
    react(),
    {
      // The old site served every picture at images/...: link previews, the structured data and search engines
      // point at those addresses, so they stay where they were.
      name: 'stable-image-urls',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          await cp(images, new URL('images/', dir), { recursive: true });
        },
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    server: { fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] } },
  },
  image: { responsiveStyles: false },
  build: { inlineStylesheets: 'always' },
  prefetch: false,
});
