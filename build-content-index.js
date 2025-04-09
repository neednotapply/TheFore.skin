#!/usr/bin/env node
/**
 * build-content-index.js
 *
 * A Node.js script to scan ./content subfolders and generate content-index.json.
 * Each file's name becomes a "title", and each word becomes a "tag".
 *
 * Usage:
 *   node build-content-index.js
 *
 * This script overwrites ./content/content-index.json with up-to-date data.
 */

const fs = require("fs");
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "content");
const OUTPUT_FILE = path.join(CONTENT_DIR, "content-index.json");

// List subfolders to scan (or auto-detect below):
const SUBFOLDERS = ["image_gen", "video_gen", "memes"];

/*
// If you want to auto-detect all subfolders:
const SUBFOLDERS = fs.readdirSync(CONTENT_DIR).filter(dir => {
  const fullPath = path.join(CONTENT_DIR, dir);
  return fs.statSync(fullPath).isDirectory() && !dir.startsWith('.');
});
*/

function fileMetadataFromName(fileName) {
  const ext = path.extname(fileName); // e.g. ".png"
  const baseName = path.basename(fileName, ext); // e.g. "Sunset_Overdrive"
  const title = baseName.replace(/[_-]+/g, " ").trim(); // e.g. "Sunset Overdrive"
  const words = baseName.split(/[\s_-]+/).map(w => w.toLowerCase());

  return {
    title,
    tags: words,
    fileName
  };
}

function scanSubfolder(subfolderName) {
  const folderPath = path.join(CONTENT_DIR, subfolderName);
  const items = [];

  const entries = fs.readdirSync(folderPath);
  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      continue;
    }
    const meta = fileMetadataFromName(entry);
    items.push(meta);
  }

  return {
    name: subfolderName,
    items
  };
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error("ERROR: content directory does not exist:", CONTENT_DIR);
    process.exit(1);
  }

  const data = { folders: [] };
  SUBFOLDERS.forEach(subfolder => {
    const subDirPath = path.join(CONTENT_DIR, subfolder);
    if (!fs.existsSync(subDirPath)) {
      console.warn("Skipping subfolder (does not exist):", subfolder);
      return;
    }
    const folderData = scanSubfolder(subfolder);
    data.folders.push(folderData);
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), "utf8");
  console.log(`Wrote content index to: ${OUTPUT_FILE}`);
}

main();
