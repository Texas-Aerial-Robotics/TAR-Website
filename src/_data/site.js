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
