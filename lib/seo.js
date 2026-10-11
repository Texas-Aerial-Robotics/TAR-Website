// ==========================================================================
// Search-engine plumbing
// --------------------------------------------------------------------------
// Two jobs, both of which only ever need to be right once:
//
//   1. Pick ONE address for every page, so a search engine does not treat
//      /about, /about.html, and /index.html as three competing pages.
//   2. Describe the organisation in the machine-readable format Google
//      reads (JSON-LD), so that a search for "texas aerial robotics" is
//      understood as a search for *us* and lands on this site.
//
// You should not need to touch this file to change the website. The things
// worth editing — the name, the links, the social profiles — all live in
// src/_data/site.js.
// ==========================================================================

/**
 * The one true path for a page.
 *
 * Netlify (and the local preview server) will serve the same page at
 * /about.html and at /about, and the home page at / and at /index.html.
 * Left alone, a search engine has to guess which is the real one and
 * splits the page's credit across the copies. So we pick the extension-less
 * form and say so in a <link rel="canonical">.
 *
 * The extension-less form is the safe one to pick: it is served whether or
 * not Netlify's "Pretty URLs" setting is on, whereas the .html form is
 * redirected away when that setting is on.
 *
 *   "/index.html"  ->  "/"
 *   "/about.html"  ->  "/about"
 */
function canonicalPath(pageUrl) {
  const path = String(pageUrl || "/").replace(/\/index\.html$/, "/");
  return path === "/" ? "/" : path.replace(/\.html$/, "");
}

/** The canonical path with the site's origin in front of it. */
function canonicalUrl(siteUrl, pageUrl) {
  return siteUrl + canonicalPath(pageUrl);
}

/** Turns any root-relative path into a full https:// URL. */
function absoluteUrl(siteUrl, path) {
  return siteUrl + (String(path).startsWith("/") ? path : `/${path}`);
}

/**
 * The structured data for one page, as a JSON-LD graph.
 *
 * Four nodes, each referring to the others by id, which is what lets a
 * search engine read them as one connected description rather than four
 * unrelated facts:
 *
 *   Organization   who we are. The important one: it is what ties this
 *                  domain to the name "Texas Aerial Robotics" and to
 *                  every other page about us on the web.
 *   WebSite        this site, published by that organisation.
 *   WebPage        the page being rendered.
 *   BreadcrumbList the trail shown under the result in Google.
 */
function organizationSchema(site) {
  const id = `${site.url}/#organization`;
  const logoId = `${site.url}/#logo`;

  return {
    "@type": "Organization",
    "@id": id,
    name: site.name,
    alternateName: [site.shortName, `${site.name} at UT Austin`],
    url: `${site.url}/`,
    logo: {
      "@type": "ImageObject",
      "@id": logoId,
      url: absoluteUrl(site.url, "/assets/brand/favicon-512.png"),
      contentUrl: absoluteUrl(site.url, "/assets/brand/favicon-512.png"),
      width: 512,
      height: 512,
      caption: site.name,
    },
    image: { "@id": logoId },
    description: site.blurb,
    foundingDate: site.founded,
    email: site.contactEmail,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Austin",
      addressRegion: "TX",
      addressCountry: "US",
    },
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: site.university,
      url: "https://www.utexas.edu/",
    },
    sameAs: site.profiles,
  };
}

function breadcrumbSchema(site, pageUrl, label) {
  const home = {
    "@type": "ListItem",
    position: 1,
    name: "Home",
    item: `${site.url}/`,
  };

  const trail = [home];
  if (label) {
    trail.push({
      "@type": "ListItem",
      position: 2,
      name: label,
      item: canonicalUrl(site.url, pageUrl),
    });
  }

  return {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl(site.url, pageUrl)}#breadcrumb`,
    itemListElement: trail,
  };
}

function pageSchema(site, { pageUrl, title, description, breadcrumbLabel }) {
  const url = canonicalUrl(site.url, pageUrl);

  const webPage = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    isPartOf: { "@id": `${site.url}/#website` },
    about: { "@id": `${site.url}/#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(site.url, "/assets/brand/og-image.jpg"),
      width: 1200,
      height: 630,
    },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    inLanguage: "en-US",
  };

  if (description) webPage.description = description;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(site),
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: `${site.url}/`,
        name: site.name,
        alternateName: site.shortName,
        description: site.blurb,
        publisher: { "@id": `${site.url}/#organization` },
        inLanguage: "en-US",
      },
      webPage,
      breadcrumbSchema(site, pageUrl, breadcrumbLabel),
    ],
  };
}

/**
 * JSON, safe to drop between <script> tags. The escape matters: without it
 * a stray "</script>" in any of the text above would end the tag early and
 * the rest of the page would be rendered as markup.
 */
function jsonLd(value) {
  return JSON.stringify(value, null, 2).replace(/</g, "\\u003c");
}

module.exports = {
  canonicalPath,
  canonicalUrl,
  absoluteUrl,
  pageSchema,
  jsonLd,
};
