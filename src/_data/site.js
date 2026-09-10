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

module.exports = {
  name: "Texas Aerial Robotics",
  university: "The University of Texas at Austin",
  location: "Austin, Texas",

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
    donate: "https://give.utexas.edu/",
  },
};
