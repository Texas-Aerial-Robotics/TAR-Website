/* ==========================================================================
   Texas Aerial Robotics — member login and workshop recordings
   --------------------------------------------------------------------------
   Runs on login.html and members.html. Talks to Supabase using the project
   URL and anon key from src/_data/site.js (window.TAR_CONFIG.supabase).

   Security lives in the database, not here: supabase/schema.sql makes the
   recordings table and storage bucket readable only by signed-in users.
   This file just signs people in and shows what Supabase lets them see.
   ========================================================================== */

(function () {
  "use strict";

  var SUPABASE_JS =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
  var TABLE = "workshop_recordings";
  var BUCKET = "workshop-recordings";
  var SIGNED_URL_SECONDS = 3600;

  var config = (window.TAR_CONFIG && window.TAR_CONFIG.supabase) || {};
  var isConfigured =
    config.url &&
    config.anonKey &&
    config.url.indexOf("YOUR-") === -1 &&
    config.anonKey.indexOf("YOUR-") === -1;

  function byId(id) {
    return document.getElementById(id);
  }

  function showStatus(el, kind, message) {
    if (!el) return;
    el.className = "form__status is-visible is-" + kind;
    el.textContent = message;
  }

  function loadSupabase() {
    return new Promise(function (resolve, reject) {
      if (window.supabase) return resolve(window.supabase);
      var tag = document.createElement("script");
      tag.src = SUPABASE_JS;
      tag.onload = function () {
        resolve(window.supabase);
      };
      tag.onerror = function () {
        reject(new Error("Could not load the login library."));
      };
      document.head.appendChild(tag);
    });
  }

  function text(tag, className, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value;
    return node;
  }

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function buildCard(row, videoUrl) {
    var card = document.createElement("article");
    card.className = "card recording";

    if (videoUrl) {
      var video = document.createElement("video");
      video.className = "recording__video";
      video.controls = true;
      video.preload = "metadata";
      video.src = videoUrl;
      card.appendChild(video);
    }

    var meta = [row.presenter, formatDate(row.recorded_on)]
      .filter(Boolean)
      .join(" · ");
    if (meta) card.appendChild(text("p", "eyebrow", meta));
    card.appendChild(text("h3", "", row.title));
    if (row.description) card.appendChild(text("p", "", row.description));
    return card;
  }

  async function resolveVideoUrl(client, row) {
    if (row.video_url) return row.video_url;
    if (!row.video_path) return "";
    var result = await client.storage
      .from(BUCKET)
      .createSignedUrl(row.video_path, SIGNED_URL_SECONDS);
    return result.error ? "" : result.data.signedUrl;
  }

  /* ---------------------------- login page ---------------------------- */

  function initLogin(client) {
    var form = byId("login-form");
    var status = byId("login-status");
    var magic = byId("login-magic");

    client.auth.getSession().then(function (result) {
      if (result.data.session) window.location.replace("/members.html");
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      var email = form.elements.email.value.trim();
      var password = form.elements.password.value;
      if (!email || !password) {
        showStatus(status, "error", "Enter your email and password.");
        return;
      }
      showStatus(status, "pending", "Signing in…");
      var result = await client.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (result.error) {
        showStatus(status, "error", "That email and password did not match.");
        return;
      }
      window.location.replace("/members.html");
    });

    magic.addEventListener("click", async function () {
      var email = form.elements.email.value.trim();
      if (!email) {
        showStatus(status, "error", "Enter your email first.");
        return;
      }
      showStatus(status, "pending", "Sending link…");
      var result = await client.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: window.location.origin + "/members.html",
        },
      });
      if (result.error) {
        showStatus(status, "error", "Could not send a link to that address.");
        return;
      }
      showStatus(status, "success", "Check your email for a sign-in link.");
    });
  }

  /* --------------------------- members page --------------------------- */

  async function initMembers(client) {
    var status = byId("members-status");
    var locked = byId("members-locked");
    var list = byId("recordings");
    var signOut = byId("sign-out");

    var session = (await client.auth.getSession()).data.session;
    if (!session) {
      locked.hidden = false;
      return;
    }

    signOut.hidden = false;
    signOut.addEventListener("click", async function () {
      await client.auth.signOut();
      window.location.replace("/login.html");
    });

    showStatus(status, "pending", "Loading recordings…");
    var result = await client
      .from(TABLE)
      .select("*")
      .order("recorded_on", { ascending: false });
    if (result.error) {
      showStatus(status, "error", "Could not load recordings. Try again later.");
      return;
    }
    if (!result.data.length) {
      showStatus(status, "success", "No recordings have been added yet.");
      return;
    }

    status.className = "form__status";
    for (var i = 0; i < result.data.length; i++) {
      var row = result.data[i];
      list.appendChild(buildCard(row, await resolveVideoUrl(client, row)));
    }
    list.hidden = false;
  }

  /* ------------------------------ start ------------------------------- */

  async function start() {
    var loginForm = byId("login-form");
    var statusEl = byId("login-status") || byId("members-status");

    if (!isConfigured) {
      showStatus(
        statusEl,
        "error",
        "Member login is not set up yet. Add the Supabase URL and anon key in src/_data/site.js."
      );
      var locked = byId("members-locked");
      if (locked) locked.hidden = false;
      return;
    }

    try {
      var lib = await loadSupabase();
      var client = lib.createClient(config.url, config.anonKey);
      if (loginForm) initLogin(client);
      else initMembers(client);
    } catch (error) {
      showStatus(statusEl, "error", error.message);
    }
  }

  start();
})();
