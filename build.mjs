#!/usr/bin/env node
// Builds clean per-store packages from the shared app/ source.
//
// app/manifest.json is the superset: it carries both Chrome and Firefox keys so
// the unpacked app/ loads directly in either browser during development. This
// script strips the keys each store doesn't want, so the *published* Chrome and
// Firefox packages are warning-free. Outputs an unpacked dir and a zip per store
// under dist/ (gitignored).
//
// Usage: node build.mjs

import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const SRC = join(ROOT, 'app')
const DIST = join(ROOT, 'dist')
const BASE_NAME = 'better-sentence-segmentation'

const manifest = JSON.parse(readFileSync(join(SRC, 'manifest.json'), 'utf8'))
const { version } = manifest

// Each transform mutates a deep clone of the manifest, removing the keys the
// other browser owns.
const targets = {
  chrome(m) {
    delete m.browser_specific_settings // Firefox-only
    delete m.background.scripts // Firefox event-page fallback
  },
  firefox(m) {
    delete m.key // Chrome signing key
    delete m.update_url // Chrome-only; Firefox updates via AMO
    delete m.background.service_worker // Chrome-only
  },
}

rmSync(DIST, { recursive: true, force: true })
mkdirSync(DIST, { recursive: true })

for (const [target, transform] of Object.entries(targets)) {
  const outDir = join(DIST, target)
  cpSync(SRC, outDir, { recursive: true })

  const storeManifest = structuredClone(manifest)
  transform(storeManifest)
  writeFileSync(
    join(outDir, 'manifest.json'),
    JSON.stringify(storeManifest, null, 2) + '\n',
  )

  const zipPath = join(DIST, `${BASE_NAME}-${version}-${target}.zip`)
  execSync(`zip -rX "${zipPath}" . -x '.DS_Store' -x '*/.DS_Store'`, {
    cwd: outDir,
    stdio: 'ignore',
  })
  console.log(`built ${target} -> ${zipPath}`)
}
