# Texas Aerial Robotics — website

The public website for Texas Aerial Robotics at UT Austin.

It is deliberately built with **plain HTML, CSS, and JavaScript**. There is no
React and no Tailwind. The only tool involved is
[Eleventy](https://www.11ty.dev/), a small static site generator whose entire
job here is to let the header, the footer, and the `<head>` block live in one
file instead of being copy-pasted into all eight pages. It turns the templates
in `src/` into ordinary HTML files in `_site/`. What ships is still plain HTML.

If you can edit a text file, you can edit this site.

---

## Quick start

```bash
npm install          # once
npm run dev          # http://localhost:4173, reloads as you save
```

Leave that running while you work. Editing anything in `src/` or `assets/`
refreshes the browser.

To build the finished site once, without the preview server:

```bash
npm run build        # writes _site/
```

`_site/` is generated. Never edit it by hand — it is deleted and rebuilt every
time. It is also not committed to git.

To run it the way Netlify does, including the contact function:

```bash
npm run netlify      # http://localhost:8888 via the Netlify CLI
```

Use this one whenever you are working on the contact form. `npm run dev` is
Eleventy on its own, and Eleventy does not run serverless functions, so the
Discord notification 404s there. That 404 is harmless — the message still
reaches Formspark — but Discord will stay quiet until you either use
`npm run netlify` or deploy.

---

## What is where

```
src/                    Everything you edit to change a page
  index.njk             Home
  about.njk             About  (history, skills, sub-teams, officer list)
  projects.njk          Projects  (current teams + archived IARC missions)
  ravg.njk              RAVG  (the RTX Autonomous Vehicle Competition team)
  partners.njk          Partners  (sponsor logos + partnership tiers)
  contact.njk           Contact  (the contact form)
  donate.njk            Donate
  404.njk               Shown for any URL that does not exist

  _includes/
    base.njk            The <head>, and the wrapper every page sits inside
    partials/header.njk The top bar. Written once, appears on every page.
    partials/footer.njk The footer. Written once, appears on every page.

  _data/
    site.js             Links, email address, contact form destination
    nav.js              Every link in the top bar and in the footer

  src.11tydata.js       Defaults shared by all pages (rarely touched)

assets/                 Copied to the finished site untouched
  brand/
    logos/              The TAR logo kit. See "Which logo do I use?" below.
    favicon*.png        Browser tab icons, generated from the logo
    og-image.jpg        The image that shows up when the site is linked in
                        Slack, iMessage, LinkedIn, etc.
  icons/                Interface icons and company logos.
                        See assets/icons/README.md for how to add one.
  css/site.css          Every style on the site, in one commented file
  js/site.js            Mobile menu, scroll animations, footer year
  js/contact-form.js    Contact page only: sends the form
  js/carousel.js        Projects page only: the "Past missions" carousel

netlify/functions/
  contact.js            An alternative contact backend: receives the form and
                        forwards it by SMTP and/or to a webhook. Not used by
                        default — see "The contact form" below.

eleventy.config.js      Build settings (rarely touched)
netlify.toml            Netlify settings (nothing to change for a normal deploy)
sitemap.xml             List of pages for search engines
robots.txt              Search engine instructions
_site/                  Generated. Do not edit.
```

### What a page file looks like

Each file in `src/` starts with a small settings block between `---` lines,
followed by ordinary HTML:

```
---
title: "About | Texas Aerial Robotics"
description: "Founded in 2017 at UT Austin..."
navKey: "about"
---

<section class="page-hero">
  ...
</section>
```

The available settings are listed in a comment at the top of
`src/_includes/base.njk`. Everything after the second `---` is dropped into
`<main>` on the finished page, with the header and footer added around it.

---

## Common edits

### Change wording on a page

Open the matching `.njk` file in `src/` and edit the text between the tags. It
is plain HTML; the `.njk` extension only means Eleventy is allowed to fill in
the shared pieces.

### Change a colour, font, or spacing

Open `assets/css/site.css` and look at the block at the very top called
`1. THEME`. Every colour and font on the site comes from there. Change
`--orange` once and it updates across all eight pages.

### Add or rename a navigation tab

One edit, in `src/_data/nav.js`. Add a line to the `primary` list:

```js
{ key: "outreach", label: "Outreach", url: "/outreach.html" },
```

Then create `src/outreach.njk` with `navKey: "outreach"` in its settings block.
The tab highlights itself on the page whose `navKey` matches.

### Change the footer links

Also `src/_data/nav.js`, in the `footer` list. Each column has a `heading` and
a list of links. A link can carry an `icon` (any name from the icon list at the
bottom of `assets/css/site.css`) and `external: true` to open in a new tab.

### Add a partner logo

1. Drop the image into `assets/brand/partners/` (create the folder the first
   time).
2. In `src/partners.njk`, find a `<div class="logo-slot">Partner logo</div>`
   and replace the text with:
   ```html
   <img src="/assets/brand/partners/acme.png" alt="Acme Robotics" />
   ```
3. Delete any leftover empty slots.

The home page also has a smaller set of slots near the bottom.

### Update the officer list

`src/about.njk`, in the section commented `OFFICERS`. Copy one of the
`<article class="card">` blocks to add a person, delete a block to remove one.

### Add a project

`src/projects.njk`, in the section commented `WHAT WE ARE BUILDING THIS YEAR`.
Copy one `<article class="card">` block and change its icon, label, name, and
copy. The row stays centred no matter how many cards there are. To show it on
the home page too, copy a card in the matching section of `src/index.njk`.

### Add a card to the "Past missions" carousel

`src/projects.njk`, in the section commented `PAST MISSIONS`. Copy an
`<article class="card">` inside `<div class="carousel__track">`. The dots
underneath are generated from however many cards it finds, so there is
nothing else to keep in sync.

To change how fast it moves, edit `data-carousel-interval` on the
`<div class="carousel">` — it is milliseconds, so `5000` is five seconds.

### Change the reasons in the contact form dropdown

`src/contact.njk`, in the `<select id="reason">`. Add or reword the `<option>`
lines. Whatever is chosen is passed through to Formspark, so no other file
needs changing. Leave the first, empty option in place: it is what keeps the
message box locked until a reason is picked.

### Update links and the contact email

All in one place: `src/_data/site.js`.

> The email currently in that file, `texasaerialrobotics@gmail.com`, is a
> placeholder. Replace it with the real inbox. It is used in the "Contact
> details" panel and in the fallback `mailto:` link, both of which read it
> from `site.js`.

### Link to something outside this site

Add `target="_blank" rel="noopener"` so it opens in a new tab and leaves the
site open behind it:

```html
<a href="https://example.com" target="_blank" rel="noopener">Example</a>
```

Links in the footer get this automatically from `external: true` in
`src/_data/nav.js`.

---

## The contact form

Every message goes to two places:

| Where | What it is | Set in |
| ----- | ---------- | ------ |
| **Formspark** | The message's real home. It stores the submission and emails you. This is what decides whether the visitor sees "sent" or an error. | `contactEndpoint` in `src/_data/site.js` |
| **Discord** | A notification embed in your server channel. Best effort — if it fails the visitor is not told, because the message is already safe in Formspark. | `notifyEndpoint` in `src/_data/site.js`, plus `DISCORD_WEBHOOK_URL` in Netlify |

```js
contactEndpoint: "https://submit-form.com/VxqZQNAmW",
notifyEndpoint:  "/.netlify/functions/contact",
```

Manage notification addresses, spam filtering, and the submission archive at
<https://formspark.io>. Set `notifyEndpoint` to `""` to switch the Discord
notification off.

### Discord notifications

The Netlify function posts an embed that looks like this:

```
Sponsorship -- Ada Lovelace
Company Sponsorship
We would love to sponsor the team this season. Who do we talk to?
```

The title is the subject (or the reason, if the subject was left blank)
followed by the sender's name; then the reason they picked; then what they
wrote. Their email address sits in the footer of the embed so you can reply.
To change the layout, edit `sendToDiscord` in `netlify/functions/contact.js`.

**Setting it up.** In Discord: *Server Settings → Integrations → Webhooks →
New Webhook*, pick the channel, and copy the URL. In Netlify: *Site
configuration → Environment variables*, add `DISCORD_WEBHOOK_URL` with that
value, and redeploy.

> **Do not put the webhook URL in this repository or in any file under
> `assets/`.** This repo is public and everything under `assets/` is served
> to visitors. Anyone holding that URL can post anything they like to your
> channel. It belongs in the Netlify environment variables and nowhere else.
> If a URL does leak, delete the webhook in Discord and make a new one.

The embed is sent with `allowed_mentions: { parse: [] }`, so a visitor cannot
make the bot ping `@everyone` by typing it into the form.

**Trying it locally.** Copy `.env.example` to `.env`, put the webhook URL in
it, and start the Netlify CLI. `.env` is git-ignored, so the URL stays on your
machine.

```bash
cp .env.example .env     # then fill in DISCORD_WEBHOOK_URL
npm run netlify          # http://localhost:8888/contact.html
```

Plain `npm run dev` will not work for this: it serves the site but not the
function, so you get `404 /.netlify/functions/contact` in the console and no
Discord message.

Two things to know when editing the form:

- **Every field needs a `name`.** That is the label the submission is filed
  under. A field without a `name` is simply not recorded. Add a field and it
  shows up in Formspark on the next submission; nothing else has to change.
- **The submit button must be `type="submit"`**, otherwise the form does not
  send when JavaScript is off.

The form works both ways round. With JavaScript on,
`assets/js/contact-form.js` intercepts the submit and posts this JSON in the
background, so the visitor stays on the page:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "subject": "Sponsorship",
  "reason": "Company Sponsorship",
  "message": "Hello!",
  "page": "https://.../contact.html"
}
```

With JavaScript off, the browser submits the form normally to the same URL and
Formspark shows its own confirmation page. To send visitors to a page of your
own instead, add a hidden field inside the form:

```html
<input type="hidden" name="_redirect" value="https://yoursite.com/thanks.html" />
```

(Formspark ignores `_redirect` on the JavaScript path, which already keeps the
visitor on the page.)

If the request fails for any reason, the page offers a `mailto:` link so a
message is never silently lost.

### Spam and validation

Light checks, meant to turn away drive-by bots and catch honest typos without
locking out a real person. They run in `assets/js/contact-form.js` before the
message is sent, and again in `netlify/functions/contact.js`, because anything
checked only in the browser can be skipped by posting straight to the URL.

| Check | Rule |
| ----- | ---- |
| Honeypot | A hidden field named `_honeypot`. Real visitors never see it; bots fill in everything. Formspark drops these too. |
| Time trap | A form submitted less than 3 seconds after the page loaded was not filled in by a person. |
| Cooldown | The same visitor cannot send twice within 30 seconds. |
| Name | 2–80 characters, must contain letters, no links. |
| Email | Must look like an address. |
| Subject | Up to 120 characters, no links. |
| Reason | Must be one of the options in the dropdown. |
| Message | 15–4000 characters, at most 2 links. |

Anything caught this way is flagged under the field it belongs to. A bot that
trips the honeypot or the time trap is shown the same thank-you as everyone
else, so it gets no signal that it was caught.

The numbers all live in one block at the top of `assets/js/contact-form.js`
(and mirrored near the top of the Netlify function), so they are easy to
loosen if a real message ever gets turned away.

### Other things the Netlify function can do

Besides Discord, `netlify/functions/contact.js` can send messages over
**SMTP** and **to any other webhook**. Each route turns itself on when its
environment variables are present, and every configured route gets a copy.

You can also drop Formspark entirely and let the function be the mailbox, by
setting `contactEndpoint: "/.netlify/functions/contact"` in
`src/_data/site.js`.

#### Option A — send email over SMTP

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

#### Option B — POST to a webhook

| Variable                 | Example                                | Notes                                     |
| ------------------------ | -------------------------------------- | ----------------------------------------- |
| `CONTACT_WEBHOOK_URL`    | `https://hooks.slack.com/services/...` | Any endpoint that accepts a JSON POST     |
| `CONTACT_WEBHOOK_SECRET` | `some-long-random-string`              | Optional; sent as the `X-TAR-Signature` header |

Sends the raw JSON rather than a formatted embed. Works with Slack, Zapier,
Make, n8n, Airtable, or your own server.

Every configured route gets a copy of each message. If one fails the others
still deliver.

#### Testing it locally

```bash
CONTACT_WEBHOOK_URL="https://webhook.site/your-id" npm run netlify
```

Then submit the form at <http://localhost:8888/contact.html>.

### Any other destination

`contactEndpoint` can be any URL that accepts a JSON POST — Zapier, Make, a
Slack webhook, your own server:

```js
contactEndpoint: "https://hooks.zapier.com/hooks/catch/123456/abcdef/",
```

Set it to `""` and the form falls back to opening the visitor's email app with
the message pre-filled.

---

## Deploying to Netlify

1. Push this repository to GitHub.
2. In Netlify: **Add new site → Import an existing project** and pick the repo.
3. Accept the defaults. Netlify reads `netlify.toml`, so the build command
   (`npm run build`), the publish directory (`_site`), and the functions
   directory are already correct.
4. **Deploy.**

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
