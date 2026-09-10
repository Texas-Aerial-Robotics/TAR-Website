// ==========================================================================
// Navigation
// --------------------------------------------------------------------------
// Every link in the top bar and in the footer comes from this file, so a tab
// only ever has to be added, renamed, or reordered in one place.
//
// A link can have:
//   label     the visible text                          (required)
//   url       where it goes                             (required)
//   key       matches `navKey` in a page's front matter, which is how the
//             top bar knows which tab to highlight
//   icon      an icon name from the list at the bottom of assets/css/site.css
//   cta       true to render it as the filled "Donate" style button
//   external  true to open it in a new tab
// ==========================================================================

const links = require("./site.js").links;

module.exports = {
  // The tabs across the top of every page, in order.
  primary: [
    { key: "home", label: "Home", url: "/index.html" },
    { key: "about", label: "About", url: "/about.html" },
    { key: "projects", label: "Projects", url: "/projects.html" },
    { key: "ravg", label: "RAVG", url: "/ravg.html" },
    { key: "partners", label: "Partners", url: "/partners.html" },
    { key: "contact", label: "Contact", url: "/contact.html" },
    { key: "donate", label: "Donate", url: "/donate.html", cta: true },
  ],

  // The three link columns in the footer.
  footer: [
    {
      heading: "Explore",
      links: [
        { label: "Home", url: "/index.html", icon: "home" },
        { label: "About", url: "/about.html", icon: "about" },
        { label: "Projects", url: "/projects.html", icon: "projects" },
        { label: "RAVG", url: "/ravg.html", icon: "ravg" },
      ],
    },
    {
      heading: "Get involved",
      links: [
        { label: "Partners", url: "/partners.html", icon: "partners" },
        { label: "Donate", url: "/donate.html", icon: "donate" },
        { label: "Contact", url: "/contact.html", icon: "mail" },
        {
          label: "GitHub",
          url: links.github,
          icon: "github",
          external: true,
        },
      ],
    },
    {
      heading: "Follow",
      links: [
        {
          label: "Instagram",
          url: links.instagram,
          icon: "instagram",
          external: true,
        },
        {
          label: "LinkedIn",
          url: links.linkedin,
          icon: "linkedin",
          external: true,
        },
        {
          label: "Facebook",
          url: links.facebook,
          icon: "facebook",
          external: true,
        },
      ],
    },
  ],
};
