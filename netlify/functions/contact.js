/* ==========================================================================
   Contact form handler (Netlify serverless function)
   --------------------------------------------------------------------------
   The contact form POSTs JSON here. This function can do three things, and
   you turn each one on simply by setting environment variables in Netlify
   (Site configuration -> Environment variables). Set any or all of them.

   A) Post an embed to Discord
      DISCORD_WEBHOOK_URL  the webhook URL from Discord, under
                           Server Settings -> Integrations -> Webhooks

      Never put this URL in the website's own files: this repository is
      public, and anyone holding the URL can post to the channel. It belongs
      in the Netlify environment variables and nowhere else.

   B) Send an email over SMTP
      SMTP_HOST        e.g. smtp.gmail.com
      SMTP_PORT        e.g. 465   (defaults to 587)
      SMTP_SECURE      "true" for port 465, "false" for 587 (defaults to
                       true when the port is 465)
      SMTP_USER        the mailbox / API username
      SMTP_PASS        the password or app password
      CONTACT_TO       where the message should land, e.g. tar@utexas.edu
      CONTACT_FROM     the From: address (defaults to SMTP_USER)

   C) POST the raw message to some other webhook
      CONTACT_WEBHOOK_URL     any URL that accepts a JSON POST, such as a
                              Slack / Zapier / Make hook
      CONTACT_WEBHOOK_SECRET  optional; sent as the X-TAR-Signature header
                              so the receiving end can verify the caller

   If none of them is configured the function replies with a clear error.

   By default this function is the *notifier*, not the mailbox: the contact
   page sends the message to Formspark and pings this function alongside it.
   See README.md.

   Runtime: Node 18+ (Netlify's default). `fetch` is built in. `nodemailer`
   is listed in package.json and is only loaded if SMTP is configured.
   ========================================================================== */

"use strict";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function reply(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

/** Accepts either a JSON body or a normal form-encoded body. */
function parseBody(event) {
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : event.body || "";

  const contentType = (
    event.headers["content-type"] ||
    event.headers["Content-Type"] ||
    ""
  ).toLowerCase();

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(raw));
  }

  try {
    return JSON.parse(raw || "{}");
  } catch (error) {
    return null;
  }
}

/* --------------------------------------------------------------------------
   Validation

   The same checks the browser runs in assets/js/contact-form.js. They are
   repeated here because anything checked only in the browser can be skipped
   by posting straight to this URL.
   -------------------------------------------------------------------------- */

const MIN_MESSAGE_LENGTH = 15;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_LINKS_IN_MESSAGE = 2;
const MIN_MILLISECONDS_ON_PAGE = 2000;

const LINK_PATTERN =
  /(?:https?:\/\/|www\.)\S+|[a-z0-9-]+\.(?:com|net|org|info|biz|ru|cn|xyz|top|club|link|shop)\b/gi;

function countLinks(value) {
  const found = value.match(LINK_PATTERN);
  return found ? found.length : 0;
}

function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value);
}

/**
 * Trims a submitted value and strips control characters. Everything except
 * the message body is collapsed onto a single line, so a name or a subject
 * cannot carry a newline into an email header or an embed title.
 */
function clean(value, options) {
  const text = String(value == null ? "" : value);
  const stripped = options && options.multiline
    ? text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    : text.replace(/[\u0000-\u001f\u007f]/g, " ");

  return stripped.trim();
}

/** Returns a problem to report back, or "" if the message looks fine. */
function findProblem(message) {
  if (message.name.length < 2 || message.name.length > 80)
    return "Please include your name.";
  if (!/[a-z]/i.test(message.name)) return "Please use letters in your name.";
  if (countLinks(message.name)) return "Please leave links out of your name.";

  if (!isValidEmail(message.email))
    return "Please include a valid email address.";

  if (message.subject.length > 120) return "That subject is too long.";
  if (countLinks(message.subject))
    return "Please leave links out of the subject.";

  if (message.message.length < MIN_MESSAGE_LENGTH)
    return "Please add a little more detail.";
  if (message.message.length > MAX_MESSAGE_LENGTH)
    return "That message is too long.";
  if (countLinks(message.message) > MAX_LINKS_IN_MESSAGE)
    return "That is a lot of links.";

  return "";
}

/** Escapes text before it goes into the HTML version of the email. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Trims text to Discord's limit for a field, with an ellipsis if cut. */
function clamp(value, limit) {
  return value.length > limit ? value.slice(0, limit - 1) + "\u2026" : value;
}

/* Posts the message to Discord as an embed:

     Subject -- Ada Lovelace          <- the title
     Company Sponsorship              <- the reason they picked
     Hello, I would like to...        <- what they wrote

   To change the layout, edit the object below. Discord's own limits are
   256 characters for a title and 4096 for a description. */
async function sendToDiscord(message) {
  const headline = message.subject || message.reason || "Website message";

  const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: clamp(`${headline} -- ${message.name}`, 256),
          description: clamp(
            `**${message.reason || "No reason given"}**\n\n${message.message}`,
            4096
          ),
          color: 0xbf5700, // UT burnt orange
          timestamp: message.receivedAt,
          footer: { text: clamp(message.email, 2048) },
        },
      ],
      // Stops a visitor from making the bot ping @everyone by typing it.
      allowed_mentions: { parse: [] },
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord responded with ${response.status}`);
  }
}

async function sendWithSmtp(message) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    CONTACT_TO,
    CONTACT_FROM,
  } = process.env;

  const port = Number(SMTP_PORT || 587);
  const nodemailer = require("nodemailer");

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: SMTP_SECURE ? SMTP_SECURE === "true" : port === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  const headline = message.subject || message.reason;
  const subject = headline
    ? `[TAR website] ${headline}`
    : "[TAR website] New contact form message";

  const lines = [
    `Name:    ${message.name}`,
    `Email:   ${message.email}`,
    `Reason:  ${message.reason || "(none)"}`,
    `Subject: ${message.subject || "(none)"}`,
    `Page:    ${message.page || "(unknown)"}`,
    "",
    message.message,
  ].join("\n");

  await transport.sendMail({
    from: CONTACT_FROM || SMTP_USER,
    to: CONTACT_TO,
    replyTo: `${message.name} <${message.email}>`,
    subject,
    text: lines,
    html: `<pre style="font:14px/1.6 ui-monospace,Menlo,Consolas,monospace">${escapeHtml(
      lines
    )}</pre>`,
  });
}

async function sendToWebhook(message) {
  const headers = { "Content-Type": "application/json" };

  if (process.env.CONTACT_WEBHOOK_SECRET) {
    headers["X-TAR-Signature"] = process.env.CONTACT_WEBHOOK_SECRET;
  }

  const response = await fetch(process.env.CONTACT_WEBHOOK_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Webhook responded with ${response.status}`);
  }
}

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: JSON_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return reply(405, { error: "Use POST." });
  }

  const data = parseBody(event);

  if (!data) {
    return reply(400, { error: "Could not read that request body." });
  }

  // Honeypot field: only bots fill it in. They get the same "ok" as
  // everyone else, so they have no signal that they were caught.
  if (data._honeypot) {
    return reply(200, { ok: true });
  }

  // A form filled in and submitted in under two seconds was not filled in
  // by a person. Absent for anyone submitting without JavaScript, so it
  // only counts when it is actually present.
  const elapsedMs = Number(data.elapsedMs);
  if (Number.isFinite(elapsedMs) && elapsedMs < MIN_MILLISECONDS_ON_PAGE) {
    return reply(200, { ok: true });
  }

  const message = {
    // Control characters are stripped so nothing can smuggle line breaks
    // into an email header or a Discord embed title.
    name: clean(data.name),
    email: clean(data.email),
    subject: clean(data.subject),
    reason: clean(data.reason),
    message: clean(data.message, { multiline: true }),
    page: clean(data.page),
    receivedAt: new Date().toISOString(),
  };

  const problem = findProblem(message);
  if (problem) {
    return reply(400, { error: problem });
  }

  const discordConfigured = Boolean(process.env.DISCORD_WEBHOOK_URL);
  const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.CONTACT_TO);
  const webhookConfigured = Boolean(process.env.CONTACT_WEBHOOK_URL);

  if (!discordConfigured && !smtpConfigured && !webhookConfigured) {
    console.error(
      "Contact form is not configured. Set DISCORD_WEBHOOK_URL, " +
        "SMTP_HOST + CONTACT_TO, and/or CONTACT_WEBHOOK_URL, in the " +
        "Netlify environment variables."
    );
    return reply(501, { error: "The contact form is not configured yet." });
  }

  const jobs = [];
  if (discordConfigured) jobs.push(sendToDiscord(message));
  if (smtpConfigured) jobs.push(sendWithSmtp(message));
  if (webhookConfigured) jobs.push(sendToWebhook(message));

  const results = await Promise.allSettled(jobs);
  const failures = results.filter((result) => result.status === "rejected");

  // As long as one delivery route worked, the visitor gets a success.
  if (failures.length === results.length) {
    failures.forEach((failure) => console.error("Delivery failed:", failure.reason));
    return reply(502, { error: "We could not deliver that message." });
  }

  failures.forEach((failure) =>
    console.warn("One delivery route failed:", failure.reason)
  );

  return reply(200, { ok: true });
};
