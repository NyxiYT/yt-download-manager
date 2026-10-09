// Lint for the userscript and the hand-written parts of the extension (content.js and i18n.js are
// generated from the userscript by extension-build/convert.py). Run: npm install, then npm run lint.
import globals from 'globals';

const userscriptManager = {
  GM_addStyle: 'readonly', GM_addValueChangeListener: 'readonly', GM_download: 'readonly', GM_getValue: 'readonly',
  GM_info: 'readonly', GM_registerMenuCommand: 'readonly', GM_setValue: 'readonly', GM_unregisterMenuCommand: 'readonly',
  GM_xmlhttpRequest: 'readonly', exportFunction: 'readonly', unsafeWindow: 'readonly', lamejs: 'readonly',
};
const i18n = { YSD_I18N: 'readonly', YSD_LANG_NAMES: 'readonly', YSD_PICK_LANG: 'readonly', YSD_TR: 'readonly' };

export default [
  { ignores: ['dist/**', 'manager/**', 'extension/content/content.js', 'extension/content/i18n.js', 'extension/content/vendor/**', 'node_modules/**'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'script',
      globals: { ...globals.browser, ...globals.webextensions, ...userscriptManager, ...i18n },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true, varsIgnorePattern: '^_$' }],
      'no-redeclare': ['error', { builtinGlobals: true }],
      'no-dupe-keys': 'error',
      'no-unreachable': 'error',
      'no-self-assign': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-console': ['error', { allow: ['debug'] }],
      'no-debugger': 'error',
      eqeqeq: ['error', 'smart'],
    },
  },
];
