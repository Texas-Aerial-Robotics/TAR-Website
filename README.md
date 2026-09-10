# Texas Aerial Robotics — website

The public website for Texas Aerial Robotics at UT Austin.

It is deliberately built with **plain HTML, CSS, and JavaScript**. There is no
React, no Tailwind, no build step, and nothing to compile. If you can edit a
text file, you can edit this site. Open a `.html` file in your browser and it
works exactly as it will in production.

---

## Quick start

Double-click `index.html` and it opens in your browser. That is enough for
editing text and styles.

To view it the way Netlify serves it (nice URLs, working contact function):

```bash
npm install          # once, to fetch nodemailer for the contact function
npm run dev          # opens http://localhost:8888 via the Netlify CLI
```

Or, for a plain static preview without the contact function:

```bash
npm start            # opens http://localhost:3000
```

---

## What is where

```
index.html          Home
about.html          About  (history, skills, sub-teams, officer list)
projects.html       Projects  (current project teams + archived IARC missions)
ravg.html           RAVG  (the RTX Autonomous Vehicle Competition team)
partners.html       Partners  (sponsor logos + partnership tiers)
contact.html        Contact  (the contact form)
donate.html         Donate
404.html            Shown for any URL that does not exist

assets/
  brand/
    logos/          The TAR logo kit. See "Which logo do I use?" below.
    favicon*.png    Browser tab icons, generated from the logo
    og-image.jpg    The image that shows up when the site is linked in Slack,
                    iMessage, LinkedIn, etc.
  icons/            Interface icons, plus brand/ for company logos.
                    See assets/icons/README.md for how to add one.
  css/site.css      Every style on the site, in one commented file
  js/site-config.js Links, email address, and contact form destination
  js/site.js        Mobile menu, scroll animations, footer year
  js/contact-form.js Contact page only: sends the form
  js/carousel.js    Projects page only: the "Past missions" carousel

netlify/functions/
  contact.js        Receives the contact form and forwards it by SMTP
                    and/or to a webhook

netlify.toml        Netlify settings (nothing to change for a normal deploy)
sitemap.xml         List of pages for search engines
robots.txt          Search engine instructions
```

---

## Common edits

### Change wording on a page

Open the `.html` file and edit the text between the tags. Everything is in
plain English inside the markup; there is no separate content file to hunt
through.

### Change a colour, font, or spacing

Open `assets/css/site.css` and look at the block at the very top called
`1. THEME`. Every colour and font on the site comes from there. Change
`--orange` once and it updates across all seven pages.

### Add or rename a navigation tab

The header is copied into every page so the site works without JavaScript.
That means editing a tab is **eight small edits, not one**: `index.html`,
`about.html`, `projects.html`, `ravg.html`, `partners.html`, `contact.html`,
`donate.html`, and `404.html`. Search each file for `<nav class="nav"` and make
the same change.

The tab for the page you are on carries `class="nav__link is-current"`.

### Add a partner logo

1. Drop the image into `assets/brand/partners/` (create the folder the first
   time).
2. In `partners.html`, find a `<div class="logo-slot">Partner logo</div>` and
   replace the text with:
   ```html
   <img src="assets/brand/partners/acme.png" alt="Acme Robotics" />
   ```
3. Delete any leftover empty slots.

The home page also has a smaller set of slots near the bottom.

### Update the officer list

`about.html`, in the section commented `OFFICERS`. Copy one of the
`<article class="card">` blocks to add a person, delete a block to remove one.

### Add a project

`projects.html`, in the section commented `WHAT WE ARE BUILDING THIS YEAR`.
Copy one `<article class="card">` block and change its icon, label, name, and
copy. The row stays centred no matter how many cards there are. To show it on
the home page too, copy a card in the matching section of `index.html`.

### Add a card to the "Past missions" carousel

`projects.html`, in the section commented `PAST MISSIONS`. Copy an
`<article class="card">` inside `<div class="carousel__track">`. The dots
underneath are generated from however many cards it finds, so there is
nothing else to keep in sync.

To change how fast it moves, edit `data-carousel-interval` on the
`<div class="carousel">` — it is milliseconds, so `5000` is five seconds.

### Change the reasons in the contact form dropdown

`contact.html`, in the `<select id="reason">`. Add or reword the `<option>`
lines. Whatever is chosen is passed through to the email and the webhook, so
no other file needs changing. Leave the first, empty option in place: it is
what keeps the message box locked until a reason is picked.

### Update links and the contact email

All in one place: `assets/js/site-config.js`.

> The email currently in that file, `texasaerialrobotics@gmail.com`, is a
> placeholder. Replace it with the real inbox — it also appears in the
> "Contact details" panel in `contact.html`.

---

## The contact form

The form on `contact.html` sends a JSON payload:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "subject": "Sponsorship",
  "message": "Hello!",
  "page": "https://.../contact.html"
}
```

Where it goes is controlled by `contactEndpoint` in
`assets/js/site-config.js`. By default that is
`/.netlify/functions/contact`, the serverless function in this repo.

That function supports **SMTP, a webhook, or both at once**. Nothing is
hard-coded; you turn each route on by adding environment variables in Netlify
under *Site configuration → Environment variables*, then redeploying.

### Option A — send email over SMTP

| Variable       | Example              | Notes                                          |
| -------------- | -------------------- | ---------------------------------------------- |
| `SMTP_HOST`    | `smtp.gmail.com`     | Required to enable SMTP                        |
| `SMTP_PORT`    | `465`                | Defaults to `587`                              |
| `SMTP_SECURE`  | `true`               | Defaults to `true` when the port is 465        |
| `SMTP_USER`    | `tar@example.com`    | Mailbox or API username                        |
| `SMTP_PASS`    | `app-password`       | Use an app password, never a personal password |
| `CONTACT_TO`   | `tar@utexas.edu`     | Required — where messages land                 |
| `CONTACT_FROM` | `noreply@example.com`| Defaults to `SMTP_USER`                        |

The email's `Reply-To` is set to the visitor, so hitting reply in your inbox
answers them directly.

### Option B — POST to a webhook

| Variable                 | Example                                | Notes                                     |
| ------------------------ | -------------------------------------- | ----------------------------------------- |
| `CONTACT_WEBHOOK_URL`    | `https://hooks.slack.com/services/...` | Any endpoint that accepts a JSON POST     |
| `CONTACT_WEBHOOK_SECRET` | `some-long-random-string`              | Optional; sent as the `X-TAR-Signature` header |

Works with Slack, Discord, Zapier, Make, n8n, Airtable, or your own server.

Set both A and B and every message goes to both places. If one route fails the
other still delivers.

### Option C — skip the function entirely

Point `contactEndpoint` straight at a third-party URL:

```js
contactEndpoint: "https://hooks.zapier.com/hooks/catch/123456/abcdef/",
```

Or set it to `""` and the form falls back to opening the visitor's email app
with the message pre-filled.

### If nothing is configured

The function replies with a clear error and the page offers the visitor a
`mailto:` link, so a message is never silently lost.

### Testing it locally

```bash
npm install
CONTACT_WEBHOOK_URL="https://webhook.site/your-id" npm run dev
```

Then submit the form at <http://localhost:8888/contact.html>.

---

## Deploying to Netlify

1. Push this repository to GitHub.
2. In Netlify: **Add new site → Import an existing project** and pick the repo.
3. Accept the defaults. Netlify reads `netlify.toml`, so the publish directory
   and functions directory are already correct.
4. Add the contact form environment variables (above), then **Deploy**.

Every push to the default branch redeploys automatically. Pull requests get
their own preview URL.

After the real domain is attached, update the URLs in `sitemap.xml` and
`robots.txt`.

---

## Which logo do I use?

`assets/brand/logos/` holds the full kit. The names follow a pattern:

- `tar-logo-…` — the drone mark with "TAR" underneath
- `tar-wordmark-…` — just the word "TAR"
- `…-orange` / `…-paper` / `…-black` — the colour of the artwork
- `…-on-black` / `…-on-paper` / `…-on-orange` — the artwork has that colour
  baked in as a solid background. Files without an `-on-…` suffix are
  transparent.
- `…-primary-dark` — the full-colour logo intended for **dark** backgrounds
- `…-primary-light` — the full-colour logo intended for **light** backgrounds
- `…-tight` — cropped close to the artwork, with no surrounding padding
- `tar-mark-drone-paper.png` — just the drone, no lettering. Used in the
  header, where the words "Texas Aerial Robotics" already sit beside it.

The site uses `tar-mark-drone-paper.png` in the header,
`tar-logo-primary-dark-tight.png` in the hero, and
`tar-wordmark-paper-tight.png` in the footer, because all three sit on a dark
background.

---

## Browser support

Current versions of Chrome, Edge, Firefox, and Safari, on desktop and mobile.
The site still reads and navigates correctly with JavaScript disabled; only the
mobile menu, the scroll animations, and the background form submission need it.
