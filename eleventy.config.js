// ==========================================================================
// Eleventy configuration
// --------------------------------------------------------------------------
// Eleventy is a tiny static site generator. It exists here for one reason:
// so the header, the footer, and the <head> block are written once in
// src/_includes/ instead of being copy-pasted into every page.
//
//   npm run dev     preview at http://localhost:4173 (reloads as you save)
//   npm run build   write the finished site into _site/
//
// Nothing about the output changes: _site/ contains plain HTML files with
// no framework, exactly like before.
// ==========================================================================

module.exports = function (eleventyConfig) {
  // Copy these straight through to _site/ untouched. Eleventy only
  // processes what lives in src/, so everything else is listed here.
  eleventyConfig.addPassthroughCopy({ assets: "assets" });
  eleventyConfig.addPassthroughCopy({ "robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "sitemap.xml": "sitemap.xml" });

  // Editing a stylesheet or an image should refresh the preview too.
  eleventyConfig.addWatchTarget("assets/");

  eleventyConfig.setServerOptions({ port: 4173 });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
