/* ==========================================================================
   Texas Aerial Robotics — contact form
   --------------------------------------------------------------------------
   Sends the contact form as JSON to whatever URL is set as `contactEndpoint`
   in src/_data/site.js. Out of the box that is Formspark.

   The JSON body looks like this, so any SMTP relay, webhook, form service,
   or serverless function can consume it:

     {
       "name":    "Ada Lovelace",
       "email":   "ada@example.com",
       "subject": "Sponsorship",
       "reason":  "Company Sponsorship",
       "message": "Hello!",
       "page":    "https://texasaerialrobotics.org/contact.html"
     }

   It also keeps the message box and the send button switched off until a
   reason has been picked, so every enquiry arrives already sorted.

   If the endpoint is empty or the request fails, the visitor is offered a
   plain mailto: link so a message never gets lost.

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

  function setStatus(state, message) {
    status.className = "form__status is-visible is-" + state;
    status.textContent = message;
  }

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

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Honeypot: bots fill in every field, humans never see this one.
    if (form.elements._honeypot.value !== "") {
      setStatus("success", "Thanks! Your message has been sent.");
      form.reset();
      applyReasonGate();
      return;
    }

    if (reason && !reason.value) {
      setStatus("error", "Please choose a reason for getting in touch.");
      reason.focus();
      return;
    }

    var data = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      subject: form.elements.subject.value.trim(),
      reason: reason ? reason.value : "",
      message: form.elements.message.value.trim(),
      page: window.location.href,
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

    // Formspark only records a JSON body when both of these headers are
    // set. Other endpoints ignore the Accept header, so it is safe to send.
    fetch(config.contactEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Request failed with status " + response.status);
        }
        setStatus(
          "success",
          "Thanks, " +
            (data.name.split(" ")[0] || "friend") +
            "! We have your message and will reply as soon as we can."
        );
        form.reset();
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
