// ==========================================================================
// Project teams
// --------------------------------------------------------------------------
// Reads the two project files in src/content/ and hands the Home page and
// the Projects page lists they can loop over. To change a project, edit the
// .txt file, not this one.
//
//   projects.current   src/content/projects-current.txt
//   projects.past      src/content/projects-past.txt
// ==========================================================================

const { blocks, fields, list } = require("../../lib/content.js");

function read(filename) {
  return blocks(filename)
    .map(fields)
    .map((project) => ({
      ...project,
      // "Focus areas: A, B, C" becomes the tag list on the card.
      tags: list(project.focusAreas),
    }));
}

// Exported as a function, not a value, because Eleventy calls it again on
// every build. That is what makes `npm run dev` pick up an edit to a .txt
// file while you are watching the page.
module.exports = () => ({
  current: read("projects-current.txt"),
  past: read("projects-past.txt"),
});
