// ==========================================================================
// Reading the plain-text content files in src/content/
// --------------------------------------------------------------------------
// The sections of the site that get rewritten every year — the officer team,
// the project teams, the archive, the RTX competition task — are not written
// in HTML. They live in ordinary .txt files that anyone can edit, and the
// small readers in src/_data/ turn them into the lists the pages loop over.
//
// You should not need to touch this file to change the website. Open the
// .txt file you want instead; each one explains its own layout at the top.
// ==========================================================================

const fs = require("fs");
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "..", "src", "content");

/**
 * Splits a content file into blocks. A blank line ends one block and starts
 * the next, and a line beginning with # is a note to whoever is editing and
 * is skipped. Returns an array of blocks, each an array of its lines.
 */
function blocks(filename) {
  return fs
    .readFileSync(path.join(CONTENT_DIR, filename), "utf8")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => !/^\s*#/.test(line))
    .join("\n")
    .split(/\n\s*\n/)
    .map((block) => block.split("\n").filter((line) => line.trim() !== ""))
    .filter((block) => block.length > 0);
}

/** "Focus areas" -> focusAreas, so templates can write project.focusAreas. */
function camelCase(label) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (whole, letter) => letter.toUpperCase());
}

/**
 * Turns a block of "Label: value" lines into an object.
 *
 * A line that is indented, or that has no "Label:" in front of it, carries
 * on the value above it, so a long paragraph can be wrapped over as many
 * lines as it needs:
 *
 *     Description: A fleet of small quadcopters that fly as one, where
 *       every drone runs the same controller.
 */
function fields(blockLines) {
  const record = {};
  let currentKey = null;

  blockLines.forEach((line) => {
    const labelled = /^([A-Za-z][A-Za-z0-9 _-]*?)\s*:\s?(.*)$/.exec(line);
    const isContinuation = /^\s/.test(line) || !labelled;

    if (!isContinuation) {
      currentKey = camelCase(labelled[1]);
      record[currentKey] = labelled[2].trim();
      return;
    }

    if (currentKey) {
      record[currentKey] = `${record[currentKey]} ${line.trim()}`.trim();
    }
  });

  return record;
}

/** "ROS 2, PX4, C++" -> ["ROS 2", "PX4", "C++"] */
function list(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

module.exports = { blocks, fields, list, CONTENT_DIR };
