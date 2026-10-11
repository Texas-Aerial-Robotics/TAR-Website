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

  // src/about.njk becomes _site/about.html. Without this, Eleventy would
  // write _site/about/index.html instead.
  //
  // Links in the pages are written without the extension — "/about", not
  // "/about.html" — because that is the address the site tells search
  // engines is the real one. Netlify and the local preview server both
  // serve about.html at /about, so both forms work; linking to the one
  // address that counts keeps everything pointing the same way.
  permalink: (data) => `${data.page.filePathStem}.html`,
};
