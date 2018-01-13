#!/usr/bin/env node
/*!
 * Copyright (c) 2018 by The Monix.js Project Developers.
 * Some rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { exec } = require("shelljs")
const fs = require("fs")
const path = require("path")

if (process.argv.length < 3) {
  console.error("Missing directory argument!")
  process.exit(1)
}

const currentDir = process.argv[2]
const packageJson = path.join(currentDir, "package.json")
const scriptDir = path.dirname(process.argv[1])

const typingsModuleTS = path.join(scriptDir, "..", "common", "typings-module.d.ts")
const typingsModuleFlow = path.join(scriptDir, "..", "common", "typings-module.js.flow")

if (!fs.existsSync(packageJson)) {
  console.error(`Directory does not appear to a valid npm project: ${packageJson} missing!`)
  process.exit(1)
} else if (!fs.existsSync(typingsModuleTS)) {
  console.error(`File missing: ${typingsModuleTS}`)
  process.exit(2)
} else if (!fs.existsSync(typingsModuleFlow)) {
  console.error(`File missing: ${typingsModuleFlow}`)
  process.exit(2)
}

process.chdir(currentDir)

const srcDir = path.join(currentDir, "src")
const destDir = path.join(currentDir, "dist")

function listDir(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, function (err, items) {
      if (err) reject(err); else {
        resolve(items)
      }
    })
  })
}

async function findFlowFiles() {
  const queue = [srcDir]
  const flowFiles = []

  while (queue.length > 0) {
    const current = queue.pop() || ""
    const files = await listDir(current)

    for (const f of files) {
      const fullPath = path.join(current, f)
      const info = fs.statSync(fullPath)
      if (info.isDirectory()) queue.push(fullPath)
      else if (f.match(/\.js\.flow$/)) flowFiles.push(fullPath)
    }
  }

  return flowFiles
}

function fileNameOf(p) {
  return path.basename(p).replace(/\.\w+$/, "")
}

async function main() {
  const files = await findFlowFiles()
  for (const file of files) {
    const dPath = path.join(destDir, file.slice(srcDir.length))
    const dDir = path.dirname(dPath)
    exec(`mkdir -p "${dDir}"`)
    exec(`cp -f "${file}" "${dPath}"`)
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(currentDir, "package.json")))

  exec(`cp -f "${typingsModuleFlow}" "${currentDir}/${pkg.main}.flow"`)
  exec(`cp -f "${typingsModuleFlow}" "${currentDir}/${pkg.es5module}.flow"`)

  exec(`cp -f "${typingsModuleTS}" "${currentDir}/dist/${fileNameOf(pkg.main)}.d.ts"`)
  exec(`cp -f "${typingsModuleTS}" "${currentDir}/dist/${fileNameOf(pkg.es5module)}.d.ts"`)
}

main().then(
  _ => console.log("Done copying flow files!"),
  err => console.error(`ERROR: ${err}`)
)
