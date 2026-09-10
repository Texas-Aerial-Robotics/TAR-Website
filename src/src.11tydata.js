// ==========================================================================
// Defaults for every page in src/
// --------------------------------------------------------------------------
// Anything set here applies to all pages unless a page overrides it in its
// own front matter (the block between the --- lines at the top of the file).
// ==========================================================================

module.exports = {
  // Every page is wrapped in src/_includes/base.njk, which supplies the
  // <head>, the header, and the footer.
  layout: "base.njk",

  // src/about.njk becomes _site/about.html, so links stay "/about.html".
  // Without this, Eleventy would write _site/about/index.html instead.
  permalink: (data) => `${data.page.filePathStem}.html`,
};
