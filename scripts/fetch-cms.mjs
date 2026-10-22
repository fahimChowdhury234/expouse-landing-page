#!/usr/bin/env node
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

const CMS_API_URL = process.env.CMS_API_URL || 'http://localhost:8080/api/v1'
const CMS_RELEASE = process.env.CMS_RELEASE || 'live'
const locale = process.env.CMS_LOCALE || 'en'

const outDir = resolve(rootDir, '.cms')
const fixtureDir = resolve(rootDir, 'cms-fixtures')
mkdirSync(outDir, { recursive: true })
mkdirSync(fixtureDir, { recursive: true })

const targetFile = resolve(outDir, `${locale}.json`)
const fixtureFile = resolve(fixtureDir, `bundle-${locale}.json`)

async function fetchCmsBundle() {
  console.log(`[CMS] Fetching release '${CMS_RELEASE}' for locale '${locale}' from ${CMS_API_URL}...`)

  try {
    const url = `${CMS_API_URL}/internal/website/releases/${CMS_RELEASE}/bundle?locale=${locale}`
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    const bundle = await res.json()
    if (!bundle.pages || !bundle.pages['/']) {
      throw new Error('Received bundle is missing home page')
    }

    const json = JSON.stringify(bundle, null, 2)
    writeFileSync(targetFile, json, 'utf-8')
    writeFileSync(fixtureFile, json, 'utf-8')

    console.log(`[CMS] Bundle successfully written to .cms/${locale}.json (Release R-${bundle.release?.number ?? 1})`)
  } catch (err) {
    console.warn(`[CMS] Warning: Failed to fetch from API (${err.message}).`)
    if (existsSync(fixtureFile)) {
      console.log(`[CMS] Falling back to fixture: ${fixtureFile}`)
      const fixtureData = readFileSync(fixtureFile, 'utf-8')
      writeFileSync(targetFile, fixtureData, 'utf-8')
    } else {
      console.error(`[CMS] Error: No fixture available at ${fixtureFile}`)
      process.exit(1)
    }
  }
}

fetchCmsBundle()
