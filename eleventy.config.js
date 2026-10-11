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

const seo = require("./lib/seo.js");
const site = require("./src/_data/site.js");
const nav = require("./src/_data/nav.js");

module.exports = function (eleventyConfig) {
  // Copy these straight through to _site/ untouched. Eleventy only
  // processes what lives in src/, so everything else is listed here.
  //
  // robots.txt and sitemap.xml are not here: they contain the site's own
  // address, so they are generated from src/robots.njk and src/sitemap.njk
  // instead of being kept up to date by hand.
  eleventyConfig.addPassthroughCopy({ assets: "assets" });

  // ------------------------------------------------------------------
  // Filters the templates use to build full URLs. See lib/seo.js.
  // ------------------------------------------------------------------

  /* "/about.html" -> "https://.../about" — the one address we tell search
     engines to use for a page. */
  eleventyConfig.addFilter("canonical", (pageUrl) =>
    seo.canonicalUrl(site.url, pageUrl),
  );

  /* "/assets/x.jpg" -> "https://.../assets/x.jpg". Link previews and
     structured data need the whole URL, not a relative one. */
  eleventyConfig.addFilter("absolute", (path) =>
    seo.absoluteUrl(site.url, path),
  );

  /* ------------------------------------------------------------------
     The <script type="application/ld+json"> block in the <head>: the
     machine-readable version of "who we are and what page this is".

     Used once, in src/_includes/base.njk. The shape of what it writes
     is in lib/seo.js.
     ------------------------------------------------------------------ */
  eleventyConfig.addShortcode(
    "structuredData",
    (pageUrl, title, description, navKey) => {
      const tab = nav.primary.find((item) => item.key === navKey);

      const schema = seo.pageSchema(site, {
        pageUrl,
        title,
        description,
        // The trail Google draws under the result: Home > About. The home
        // page itself is the start of the trail, not a step in it.
        breadcrumbLabel: navKey === "home" ? null : tab && tab.label,
      });

      return `<script type="application/ld+json">\n${seo.jsonLd(schema)}\n    </script>`;
    },
  );

  // ------------------------------------------------------------------
  // Every page that belongs in search results, in the order the tabs
  // across the top of the site are in. src/sitemap.njk lists these.
  //
  // A page opts out by setting `noindex: true` in its front matter,
  // which is how the 404 page stays out.
  // ------------------------------------------------------------------
  eleventyConfig.addCollection("indexable", (collection) => {
    const navOrder = nav.primary.map((item) => seo.canonicalPath(item.url));
    const rank = (item) => {
      const position = navOrder.indexOf(seo.canonicalPath(item.url));
      return position === -1 ? navOrder.length : position;
    };

    return collection
      .getAll()
      .filter(
        (item) =>
          item.outputPath &&
          item.outputPath.endsWith(".html") &&
          !item.data.noindex,
      )
      .sort((a, b) => rank(a) - rank(b) || a.url.localeCompare(b.url));
  });

  // Editing a stylesheet, an image, or one of the plain-text content files
  // should refresh the preview too.
  eleventyConfig.addWatchTarget("assets/");
  eleventyConfig.addWatchTarget("src/content/");

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
