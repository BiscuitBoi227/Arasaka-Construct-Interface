// Runs before `npm run dev` (the "predev" script in the root package.json).
//
// `netlify dev --filter @aci/client` bundles netlify/functions/api.ts into
// client/.netlify/functions-serve/ as a CommonJS file named api.js. Node reads
// the nearest package.json to decide how to load a .js file, and
// client/package.json says "type": "module", so the function would crash with
// "module is not defined in ES module scope".
//
// This package.json sits closer to the bundle than client/package.json does,
// so Node loads it as CommonJS. client/.netlify/ is gitignored, which is why
// this script recreates the file instead of committing it.
import {mkdirSync, writeFileSync} from 'node:fs';

mkdirSync('client/.netlify', {recursive: true});
writeFileSync('client/.netlify/package.json', '{ "type": "commonjs" }\n');