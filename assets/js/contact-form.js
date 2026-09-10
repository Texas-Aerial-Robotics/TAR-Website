/* ==========================================================================
   Texas Aerial Robotics — contact form
   --------------------------------------------------------------------------
   Two jobs: check what the visitor typed, then send it.

   Where it goes is set in src/_data/site.js:

     contactEndpoint  Formspark. This is the message's real home, and it is
                      what decides whether the visitor sees success or an
                      error. It is also the form's `action`, so the form
                      still works with JavaScript switched off.

     notifyEndpoint   The Netlify function in netlify/functions/contact.js,
                      which posts a Discord embed (and email, if you have
                      set that up). Best effort: if it fails, the visitor is
                      not told, because the message itself already landed
                      safely in Formspark.

   Both receive the same JSON:

     {
       "name":    "Ada Lovelace",
       "email":   "ada@example.com",
       "subject": "Sponsorship",
       "reason":  "Company Sponsorship",
       "message": "Hello!",
       "page":    "https://texasaerialrobotics.org/contact.html"
     }

   The checks below are the light kind: enough to turn away drive-by bots and
   catch honest typos, not so strict that a real person gets locked out. All
   of them are repeated in netlify/functions/contact.js, because anything
   checked only in the browser can be skipped.

   This file only runs on contact.html.
   ========================================================================== */

(function () {
  "use strict";

  var config = window.TAR_CONFIG || {};
  var form = document.getElementById("contact-form");
  var status = document.getElementById("contact-status");

  if (!form || !status) {
    return;
  }

  var submitButton = form.querySelector('button[type="submit"]');
  var submitLabel = submitButton ? submitButton.textContent : "Send message";

  /* ----------------------------------------------------------------------
     Tuning knobs. Loosen or tighten these freely.
     ---------------------------------------------------------------------- */

  // A person needs a few seconds to fill in a form. A bot posts instantly.
  var MIN_SECONDS_ON_PAGE = 3;

  // How long to wait before the same visitor can send again.
  var RESEND_COOLDOWN_SECONDS = 30;

  // Bulk advertising is mostly links. Genuine messages rarely need more.
  var MAX_LINKS_IN_MESSAGE = 2;

  var MIN_MESSAGE_LENGTH = 15;
  var MAX_MESSAGE_LENGTH = 4000;

  var openedAt = Date.now();
  var lastSentAt = 0;

  function setStatus(state, message) {
    status.className = "form__status is-visible is-" + state;
    status.textContent = message;
  }

  /* ----------------------------------------------------------------------
     Validation
     ---------------------------------------------------------------------- */

  var LINK_PATTERN =
    /(?:https?:\/\/|www\.)\S+|[a-z0-9-]+\.(?:com|net|org|info|biz|ru|cn|xyz|top|club|link|shop)\b/gi;

  function countLinks(value) {
    var found = value.match(LINK_PATTERN);
    return found ? found.length : 0;
  }

  // Every option in the dropdown, read from the page so this stays correct
  // when someone edits the list in contact.njk.
  function allowedReasons() {
    var options = form.elements.reason ? form.elements.reason.options : [];
    var values = [];

    for (var i = 0; i < options.length; i += 1) {
      if (options[i].value) {
        values.push(options[i].value);
      }
    }

    return values;
  }

  // One function per field. Each returns an error to show, or "" if fine.
  var checks = {
    name: function (value) {
      if (!value) return "Please tell us your name.";
      if (value.length < 2) return "That name looks a little short.";
      if (!/[a-z]/i.test(value)) return "Please use letters in your name.";
      if (countLinks(value)) return "Please leave links out of your name.";
      return "";
    },

    email: function (value) {
      if (!value) return "We need an email address to reply to.";
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value))
        return "That does not look like an email address.";
      return "";
    },

    subject: function (value) {
      if (countLinks(value)) return "Please leave links out of the subject.";
      return "";
    },

    reason: function (value) {
      if (!value) return "Please choose a reason for getting in touch.";
      if (allowedReasons().indexOf(value) === -1)
        return "Please choose one of the listed reasons.";
      return "";
    },

    message: function (value) {
      if (!value) return "Please write us a message.";
      if (value.length < MIN_MESSAGE_LENGTH)
        return "Please add a little more detail, so we can help properly.";
      if (value.length > MAX_MESSAGE_LENGTH)
        return "That message is too long. Please keep it under " +
          MAX_MESSAGE_LENGTH +
          " characters.";
      if (countLinks(value) > MAX_LINKS_IN_MESSAGE)
        return "That is a lot of links. Please send at most " +
          MAX_LINKS_IN_MESSAGE +
          ".";
      return "";
    },
  };

  function showFieldError(fieldName, error) {
    var input = form.elements[fieldName];
    if (!input) return;

    var wrapper = input.closest(".field");
    var errorLine = document.getElementById(fieldName + "-error");

    if (wrapper) wrapper.classList.toggle("field--invalid", Boolean(error));
    if (errorLine) errorLine.textContent = error;
    input.setAttribute("aria-invalid", error ? "true" : "false");
  }

  function checkField(fieldName) {
    var input = form.elements[fieldName];
    if (!input) return "";

    var error = checks[fieldName](input.value.trim());
    showFieldError(fieldName, error);
    return error;
  }

  /**
   * Checks every field and marks up the ones that need fixing.
   * Returns the first field with a problem, or null if all is well.
   */
  function checkEverything() {
    var firstBad = null;

    Object.keys(checks).forEach(function (fieldName) {
      if (checkField(fieldName) && !firstBad) {
        firstBad = fieldName;
      }
    });

    return firstBad;
  }

  function clearAllErrors() {
    Object.keys(checks).forEach(function (fieldName) {
      showFieldError(fieldName, "");
    });
  }

  // Once a field has been flagged, re-check it as the visitor fixes it, so
  // the warning disappears the moment it stops being true. An untouched
  // field is left alone until submit, so nothing turns red before the
  // visitor has had a chance to fill it in.
  Object.keys(checks).forEach(function (fieldName) {
    var input = form.elements[fieldName];
    if (!input) return;

    input.addEventListener("blur", function () {
      if (input.value.trim()) checkField(fieldName);
    });

    input.addEventListener("input", function () {
      var wrapper = input.closest(".field");
      if (wrapper && wrapper.classList.contains("field--invalid")) {
        checkField(fieldName);
      }
    });
  });

  /* ----------------------------------------------------------------------
     Gate the message box behind the reason dropdown

     The message field and the send button start out switched off, and only
     wake up once a reason has been chosen. They are enabled in the HTML and
     switched off here, so that a visitor without JavaScript still gets a
     usable form.
     ---------------------------------------------------------------------- */

  var reason = form.elements.reason;
  var messageField = form.elements.message;
  var messageWrapper = document.getElementById("message-field");

  function applyReasonGate() {
    var chosen = Boolean(reason && reason.value);

    if (messageField) {
      messageField.disabled = !chosen;
    }
    // Greys out the "Message" label alongside the box it belongs to.
    if (messageWrapper) {
      messageWrapper.classList.toggle("field--locked", !chosen);
    }
    if (submitButton) {
      submitButton.disabled = !chosen;
    }
  }

  if (reason) {
    reason.addEventListener("change", applyReasonGate);
    applyReasonGate();
  }

  /* ----------------------------------------------------------------------
     Sending
     ---------------------------------------------------------------------- */

  /** Builds a mailto: link so the visitor can send the message themselves. */
  function mailtoFallback(data) {
    var body =
      "Name: " +
      data.name +
      "\nEmail: " +
      data.email +
      "\nReason: " +
      data.reason +
      "\n\n" +
      data.message;

    return (
      "mailto:" +
      (config.contactEmail || "") +
      "?subject=" +
      encodeURIComponent(data.subject || data.reason || "Website enquiry") +
      "&body=" +
      encodeURIComponent(body)
    );
  }

  function offerMailto(data) {
    setStatus(
      "error",
      "We could not send that automatically. Please email us directly."
    );

    var link = document.createElement("a");
    link.href = mailtoFallback(data);
    link.textContent = "Open your email app instead";
    link.style.display = "inline-block";
    link.style.marginTop = "8px";
    link.style.fontWeight = "700";
    status.appendChild(document.createElement("br"));
    status.appendChild(link);
  }

  // Formspark only records a JSON body when both of these headers are set.
  // Other endpoints ignore the Accept header, so it is safe to send.
  function post(url, data) {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Honeypot: bots fill in every field, humans never see this one.
    // Bots are shown the same thank-you as everyone else, so they have no
    // signal that they were caught.
    if (form.elements._honeypot.value !== "") {
      setStatus("success", "Thanks! Your message has been sent.");
      form.reset();
      clearAllErrors();
      applyReasonGate();
      return;
    }

    // Nobody reads a page and writes a message in under three seconds.
    if ((Date.now() - openedAt) / 1000 < MIN_SECONDS_ON_PAGE) {
      setStatus("success", "Thanks! Your message has been sent.");
      form.reset();
      clearAllErrors();
      applyReasonGate();
      return;
    }

    var sinceLastSend = (Date.now() - lastSentAt) / 1000;
    if (lastSentAt && sinceLastSend < RESEND_COOLDOWN_SECONDS) {
      setStatus(
        "error",
        "That has already been sent. Give us a moment before sending another."
      );
      return;
    }

    var firstBad = checkEverything();
    if (firstBad) {
      setStatus("error", "Please fix the highlighted fields and try again.");
      form.elements[firstBad].focus();
      return;
    }

    var data = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      subject: form.elements.subject.value.trim(),
      reason: reason ? reason.value : "",
      message: form.elements.message.value.trim(),
      page: window.location.href,
      // How long the visitor spent on the page. The server uses it the same
      // way the check above does.
      elapsedMs: Date.now() - openedAt,
    };

    // No endpoint configured: go straight to the email client.
    if (!config.contactEndpoint) {
      window.location.href = mailtoFallback(data);
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending\u2026";
    }
    setStatus("pending", "Sending your message\u2026");

    // Fire-and-forget. A failure here does not concern the visitor: their
    // message is safe in Formspark either way.
    if (config.notifyEndpoint && config.notifyEndpoint !== config.contactEndpoint) {
      post(config.notifyEndpoint, data).catch(function () {});
    }

    post(config.contactEndpoint, data)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Request failed with status " + response.status);
        }
        lastSentAt = Date.now();
        setStatus(
          "success",
          "Thanks, " +
            (data.name.split(" ")[0] || "friend") +
            "! We have your message and will reply as soon as we can."
        );
        form.reset();
        clearAllErrors();
      })
      .catch(function () {
        offerMailto(data);
      })
      .finally(function () {
        if (submitButton) {
          submitButton.textContent = submitLabel;
        }
        // Re-locks the message box if the form was reset after sending.
        applyReasonGate();
      });
  });
})();
