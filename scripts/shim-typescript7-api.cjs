/**
 * TypeScript 7 ships `tsc` but not the legacy compiler API that Next.js,
 * typescript-eslint, and twoslash still import from `typescript`.
 *
 * After install:
 * 1. Point the package `exports` at `@typescript/typescript6` for tooling
 * 2. Add the `lib/typescript.js` file Next.js probes for on disk
 *
 * The installed package remains `typescript@7` and `tsc` stays native TS7.
 *
 * @see https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6-0
 * @see https://github.com/IshtarStar/typescript-eslint-typescript-7-repro/tree/fix/typescript-7-eslint-patch
 */
'use strict';

const fs = require('fs');
const path = require('path');

let typescriptDir;
try {
  typescriptDir = path.dirname(require.resolve('typescript/package.json'));
} catch {
  process.exit(0);
}

const packageJsonPath = path.join(typescriptDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (!String(packageJson.version).startsWith('7.')) {
  process.exit(0);
}

require.resolve('@typescript/typescript6/package.json');

// typescript@7 sets "type": "module", so the CJS entry must use .cjs.
const cjsShimPath = path.join(typescriptDir, 'lib', 'typescript.cjs');
fs.writeFileSync(
  cjsShimPath,
  `'use strict';\nmodule.exports = require('@typescript/typescript6');\n`,
);

// Next.js checks for this exact path with fs.existsSync (not package exports).
const esmShimPath = path.join(typescriptDir, 'lib', 'typescript.js');
fs.writeFileSync(
  esmShimPath,
  `import { createRequire } from 'node:module';\nconst require = createRequire(import.meta.url);\nexport default require('@typescript/typescript6');\n`,
);

packageJson.exports = {
  ...packageJson.exports,
  '.': './lib/typescript.cjs',
  './lib/typescript.js': './lib/typescript.cjs',
};

fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 4)}\n`);
