// ==========================================================================
// The RTX competition task
// --------------------------------------------------------------------------
// Reads src/content/ravg-competition.txt. RTX sets a new task every year, so
// that .txt file is the one to rewrite each season, not this one.
//
//   ravg.task       the headline, the overview paragraph, and its tags
//   ravg.steps      the mission sequence, in order
//   ravg.vehicles   the vehicles we are building for it
// ==========================================================================

const { blocks, fields, list } = require("../../lib/content.js");

// Exported as a function, not a value, because Eleventy calls it again on
// every build. That is what makes `npm run dev` pick up an edit to the .txt
// file while you are watching the page.
module.exports = () => {
  const all = blocks("ravg-competition.txt").map(fields);

  // Which kind of block each one is depends on the label it starts with.
  const task = all.find((block) => block.headline) || {};

  return {
    task: { ...task, tags: list(task.focusAreas) },

    steps: all.filter((block) => block.step),

    vehicles: all
      .filter((block) => block.vehicle)
      .map((vehicle) => ({ ...vehicle, tags: list(vehicle.focusAreas) })),
  };
};
