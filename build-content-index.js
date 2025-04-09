#!/usr/bin/env node
/**
 * build-content-index.js
 *
 * A Node.js script that scans subfolders in `./content` and creates a JSON index of files.
 * Each file's "title" is derived from the filename (with underscores/spaces removed).
 * Each word in the filename becomes a separate "tag".
 *
 * Usage:
 *   1. Make sure you have Node.js installed.
 *   2. In your project root: `node build-content-index.js`
 *   3. It will generate or overwrite `content/content-index.json`.
 *
 * Then your front-end can fetch `content-index.json` to see the updated listing.
 */
const fs = require("fs");
const path = require("path");

// The base "content" directory relative to this script:
const CONTENT_DIR = path.join(__dirname, "content");
// The output file where we'll write our JSON index:
const OUTPUT_FILE = path.join(CONTENT_DIR, "content-index.json");

// List of subfolders we want to scan (you can expand this if you have more):
// Or we can auto-detect subfolders inside ./content – see comment below
const SUBFOLDERS = ["image_gen", "video_gen", "memes"];

// If you want to auto-detect subfolders instead, comment out the SUBFOLDERS array
// and use something like:
// const SUBFOLDERS = fs.readdirSync(CONTENT_DIR).filter(name => {
//   const fullPath = path.join(CONTENT_DIR, name);
//   return fs.statSync(fullPath).isDirectory() && name !== 'node_modules';
// });

/**
 * Convert a filename (e.g., "Sunset_Overdrive.png") into:
 *   {
 *     title: "Sunset Overdrive",
 *     tags: ["sunset", "overdrive"],
 *     fileName: "Sunset_Overdrive.png"
 *   }
 * We'll also remove the file extension from the title.
 */
function fileMetadataFromName(fileName) {
  // e.g. "Sunset_Overdrive.png" -> baseName = "Sunset_Overdrive"
  const ext = path.extname(fileName); // e.g. ".png"
  const baseName = path.basename(fileName, ext); // e.g. "Sunset_Overdrive"

  // Convert underscores / hyphens to spaces for a friendlier "title"
  // e.g. "Sunset Overdrive"
  const title = baseName.replace(/[_-]+/g, " ").trim();

  // For tags, we split on non-alphabetic characters to get each "word"
  // e.g. "Sunset Overdrive" -> ["Sunset", "Overdrive"] -> each lowercased
  const words = baseName.split(/[\s_-]+/).map(w => w.toLowerCase());

  return {
    title,
    tags: words,
    fileName
  };
}

/**
 * Scan a subfolder (like "image_gen"), returning an array of item objects.
 * We ignore directories or hidden files.
 */
function scanSubfolder(subfolderName) {
  const folderPath = path.join(CONTENT_DIR, subfolderName);
  const items = [];

  // Read everything in the subfolder
  const entries = fs.readdirSync(folderPath);
  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry);
    // Skip directories
    if (fs.statSync(fullPath).isDirectory()) {
      continue;
    }
    // Possibly skip hidden/system files or unsupported extensions, if desired
    // For now, let's just parse the file name
    const meta = fileMetadataFromName(entry);
    // You might add other fields (size, date, etc.) if you want
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

  const data = {
    folders: []
  };

  SUBFOLDERS.forEach(subfolder => {
    const subDirPath = path.join(CONTENT_DIR, subfolder);
    if (!fs.existsSync(subDirPath)) {
      console.warn("Skipping subfolder (does not exist):", subfolder);
      return;
    }
    const folderData = scanSubfolder(subfolder);
    data.folders.push(folderData);
  });

  // Write out the JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), "utf8");
  console.log(`Wrote content index to: ${OUTPUT_FILE}`);
}

// Run our main function
main();
