import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const TEMPLATE = new URL('./sw.js', import.meta.url);

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)]
  );
}

/**
 * Vite plugin: after the build, writes dist/sw.js from src/pwa/sw.js with the list of files
 * to cache for offline play, and a version hash computed from their contents.
 * @param {{ exclude?: string[] }} options  path prefixes not to precache (e.g. 'screenshots/')
 */
export function serviceWorker({ exclude = [] } = {}) {
  let outDir;
  return {
    name: 'math-attack-service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const files = listFiles(outDir)
        .map((file) => relative(outDir, file).split(sep).join('/'))
        .filter((file) => file !== 'sw.js' && !file.endsWith('.DS_Store'))
        .filter((file) => !exclude.some((prefix) => file.startsWith(prefix)))
        .sort();
      const hash = createHash('sha256');
      for (const file of files) {
        hash.update(file);
        hash.update(readFileSync(join(outDir, file)));
      }
      const sw = readFileSync(TEMPLATE, 'utf8')
        .replace("'__VERSION__'", JSON.stringify(hash.digest('hex').slice(0, 12)))
        .replace('[/* __PRECACHE__ */]', JSON.stringify(['./', ...files], null, 2));
      writeFileSync(join(outDir, 'sw.js'), sw);
    }
  };
}
