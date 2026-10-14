/// <reference types="astro/client" />

// The custom directive from astro.config.mjs (src/directives/lazy.ts).
declare namespace Astro {
  interface ClientDirectives {
    'client:lazy'?: boolean;
  }
}
