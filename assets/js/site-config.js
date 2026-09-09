/* ==========================================================================
   Texas Aerial Robotics — site settings
   --------------------------------------------------------------------------
   This is the one file to edit when a link, an email address, or the contact
   form destination changes. Everything below is plain JavaScript: keep the
   quotes and the commas where they are and you cannot break anything.
   ========================================================================== */

window.TAR_CONFIG = {
  /* ------------------------------------------------------------------
     Contact form destination.

     Leave this as "/.netlify/functions/contact" to use the serverless
     function that ships with this site (netlify/functions/contact.js).
     That function can send email over SMTP, POST to a webhook, or both,
     depending on the environment variables you set in Netlify.

     You can also point this straight at any URL that accepts a JSON POST,
     for example a Zapier / Make / Slack / Discord webhook:
       contactEndpoint: "https://hooks.zapier.com/hooks/catch/123/abc/",

     Or set it to "" (empty string) to fall back to opening the visitor's
     email client with the message pre-filled.
     ------------------------------------------------------------------ */
  contactEndpoint: "/.netlify/functions/contact",

  /* Where the "email us instead" links point, and the fallback destination
     if contactEndpoint is empty or the request fails.
     CHECK THIS: it is a placeholder until someone confirms the real inbox. */
  contactEmail: "texasaerialrobotics@gmail.com",

  /* Shown on the Contact page. */
  mailingAddress:
    "The University of Texas at Austin, Austin, TX 78712",

  /* Social + external links. Used in the footer and on several pages. */
  links: {
    instagram: "https://www.instagram.com/texasaerialrobotics/",
    linkedin: "https://www.linkedin.com/company/texas-aerial-robotics/",
    facebook: "https://www.facebook.com/texasaerialrobotics/",
    github: "https://github.com/Texas-Aerial-Robotics",
    donate: "https://give.utexas.edu/",
  },
};
