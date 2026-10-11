// ==========================================================================
// Texas Aerial Robotics — site settings
// --------------------------------------------------------------------------
// This is the one file to edit when a link, an email address, or the contact
// form destination changes. Everything below is plain JavaScript: keep the
// quotes and the commas where they are and you cannot break anything.
//
// Anything here is available in the templates as `site.something`, for
// example {{ site.contactEmail }}.
// ==========================================================================

/* ------------------------------------------------------------------
   Public site origin — the address people actually type in.

   Everything absolute on the site is built from this: the canonical
   tags that tell Google which URL is the real one, the link-preview
   URLs, robots.txt, and sitemap.xml. If it points somewhere that does
   not exist, Google cannot crawl the pages the sitemap advertises and
   the canonical tags send it to a dead domain, so the site does not
   rank. It is worth getting right.

   It is resolved in this order:

     1. SITE_URL, if you set it yourself. Use this to override.
     2. URL, which Netlify sets automatically to the site's primary
        address. Attach a custom domain in Netlify and this picks it
        up on the next deploy with no code change.
     3. FALLBACK_SITE_URL below, for local builds.

   Only the origin is kept: no trailing slash, no path.
   ------------------------------------------------------------------ */
const FALLBACK_SITE_URL = "https://texasaerialrobotics.netlify.app";

function resolveSiteUrl() {
  for (const candidate of [process.env.SITE_URL, process.env.URL]) {
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.origin;
      }
    } catch {
      // Not set, or not a URL. Try the next one.
    }
  }
  return FALLBACK_SITE_URL;
}

module.exports = {
  name: "Texas Aerial Robotics",
  shortName: "TAR",
  university: "The University of Texas at Austin",
  location: "Austin, Texas",
  founded: "2017",

  url: resolveSiteUrl(),

  /* ------------------------------------------------------------------
     Is this build the real, public site?

     Netlify sets CONTEXT to "production" only for the live site. Deploy
     previews and branch deploys are also public, on their own addresses,
     and a search engine will happily index them as a second copy of the
     site competing with the real one. So robots.txt closes the door on
     anything that is not production. Local builds count as production so
     that what you see locally is what deploys.
     ------------------------------------------------------------------ */
  isProduction: (process.env.CONTEXT || "production") === "production",

  /* The academic year. Shown above the project list and the officer team,
     so both move on with one edit here. */
  season: "2026 – 2027",

  // Used under the logo in the footer.
  blurb:
    "An undergraduate research organization at The University of Texas at Austin, building fully autonomous drones.",

  /* ------------------------------------------------------------------
     Contact form destination.

     This is the Formspark endpoint. It is used in two places:
       - the form's `action`, so the form still works with JavaScript off
       - assets/js/contact-form.js, which posts to it in the background

     Formspark takes any field you send it, so adding or removing a field
     on the contact page needs no change here. Manage notification emails
     and spam settings at https://formspark.io.

     Two alternatives, if you ever move off Formspark:
       - "/.netlify/functions/contact" uses the serverless function in
         netlify/functions/contact.js, which can send over SMTP, POST to a
         webhook, or both. See README.md.
       - "" (empty string) falls back to opening the visitor's email app
         with the message pre-filled.
     ------------------------------------------------------------------ */
  contactEndpoint: "https://submit-form.com/VxqZQNAmW",

  /* ------------------------------------------------------------------
     A second place the same message is sent, alongside Formspark.

     This is the serverless function in netlify/functions/contact.js. It
     posts the Discord embed, and can also send email over SMTP. It only
     does anything once DISCORD_WEBHOOK_URL is set in the Netlify
     environment variables — the URL is a credential and must not live in
     this repository, which is public.

     Set this to "" to switch the second delivery off entirely.

     If it fails, the visitor is not told: their message is already safe
     in Formspark.
     ------------------------------------------------------------------ */
  notifyEndpoint: "/.netlify/functions/contact",

  /* Where the "email us instead" links point, and the fallback destination
     if contactEndpoint is empty or the request fails.
     CHECK THIS: it is a placeholder until someone confirms the real inbox. */
  contactEmail: "texasaerialrobotics@gmail.com",

  /* Social and external links. Referenced from src/_data/nav.js and from
     the pages themselves. */
  links: {
    instagram: "https://www.instagram.com/texasaerialrobotics/",
    linkedin: "https://www.linkedin.com/company/texas-aerial-robotics/",
    facebook: "https://www.facebook.com/texasaerialrobotics/",
    github: "https://github.com/Texas-Aerial-Robotics",
    hornslink: "https://utexas.campuslabs.com/engage/organization/TAR",
    donate: "https://give.utexas.edu/",
  },

  /* ------------------------------------------------------------------
     Every page that is unambiguously *this* organisation somewhere else
     on the web. These go into the `sameAs` list in the structured data,
     which is how a search engine learns that one organisation owns all
     of them and that this site is its home page.

     Keep the old Wix site in this list for as long as it is still up. It
     currently outranks us for "texas aerial robotics", and listing it
     tells Google the two are one organisation rather than two, so the
     signals point here instead of competing. Delete the line once the
     Wix page is gone.
     ------------------------------------------------------------------ */
  profiles: [
    "https://utexas.campuslabs.com/engage/organization/TAR",
    "https://www.instagram.com/texasaerialrobotics/",
    "https://www.linkedin.com/company/texas-aerial-robotics/",
    "https://www.facebook.com/texasaerialrobotics/",
    "https://github.com/Texas-Aerial-Robotics",
    "https://texasaerialrobotics.wixsite.com/website",
  ],
};
