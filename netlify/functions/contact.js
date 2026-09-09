/* ==========================================================================
   Contact form handler (Netlify serverless function)
   --------------------------------------------------------------------------
   The contact form POSTs JSON here. This function can do two things, and you
   turn each one on simply by setting environment variables in Netlify
   (Site configuration -> Environment variables). Set one, the other, or both.

   A) Send an email over SMTP
      SMTP_HOST        e.g. smtp.gmail.com
      SMTP_PORT        e.g. 465   (defaults to 587)
      SMTP_SECURE      "true" for port 465, "false" for 587 (defaults to
                       true when the port is 465)
      SMTP_USER        the mailbox / API username
      SMTP_PASS        the password or app password
      CONTACT_TO       where the message should land, e.g. tar@utexas.edu
      CONTACT_FROM     the From: address (defaults to SMTP_USER)

   B) POST the message to a webhook
      CONTACT_WEBHOOK_URL     any URL that accepts a JSON POST, such as a
                              Slack / Discord / Zapier / Make hook
      CONTACT_WEBHOOK_SECRET  optional; sent as the X-TAR-Signature header
                              so the receiving end can verify the caller

   If neither is configured the function replies with a clear error and the
   browser falls back to opening the visitor's email client.

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

function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Escapes text before it goes into the HTML version of the email. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

  const subject = message.subject
    ? `[TAR website] ${message.subject}`
    : "[TAR website] New contact form message";

  const lines = [
    `Name:    ${message.name}`,
    `Email:   ${message.email}`,
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

  // Honeypot field: only bots fill it in.
  if (data["company-website"]) {
    return reply(200, { ok: true });
  }

  const message = {
    name: String(data.name || "").trim(),
    email: String(data.email || "").trim(),
    subject: String(data.subject || "").trim(),
    message: String(data.message || "").trim(),
    page: String(data.page || "").trim(),
    receivedAt: new Date().toISOString(),
  };

  if (!message.name || !message.message) {
    return reply(400, { error: "Please include your name and a message." });
  }

  if (!isValidEmail(message.email)) {
    return reply(400, { error: "Please include a valid email address." });
  }

  if (message.message.length > 8000) {
    return reply(400, { error: "That message is too long." });
  }

  const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.CONTACT_TO);
  const webhookConfigured = Boolean(process.env.CONTACT_WEBHOOK_URL);

  if (!smtpConfigured && !webhookConfigured) {
    console.error(
      "Contact form is not configured. Set SMTP_HOST + CONTACT_TO, " +
        "and/or CONTACT_WEBHOOK_URL, in the Netlify environment variables."
    );
    return reply(501, { error: "The contact form is not configured yet." });
  }

  const jobs = [];
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
