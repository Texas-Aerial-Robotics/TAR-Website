/* Draft-only behavior.

   1. The loader.
      It appears ONLY when both of these are true:
        - this is the first page load of the visit (not a click between tabs)
        - the page is still loading after SHOW_AFTER_MS
      A fast load never shows it. When it does show, a progress bar runs 0 to
      100% with the drone flying along it, tracking real load progress (DOM
      ready, then everything loaded), then fades out. It stays up at least
      MIN_VISIBLE_MS once shown so it never flashes. If anything goes wrong,
      it simply never appears.

   2. The contact page inquiry buttons.
*/
(function () {
  var SHOW_AFTER_MS = 250;
  var MIN_VISIBLE_MS = 900;
  var FAILSAFE_MS = 15000;
  var STORAGE_KEY = "tar-loader-seen";

  var loader = document.getElementById("tar-loader");
  var fill = document.getElementById("tar-loader-fill");
  var drone = document.getElementById("tar-loader-drone");
  var pct = document.getElementById("tar-loader-pct");
  if (!loader || !fill || !drone || !pct) return;

  // First load of the visit only. sessionStorage lasts until the tab closes.
  var seen = false;
  try {
    seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch (e) {
    // Storage blocked: treat every load as a first load, but the "only if it
    // is still loading" rule below still keeps the loader away on fast loads.
  }
  // Demo switch for reviewing the animation on a fast local server:
  // add ?loader=preview to any address. Shows it now and holds 10 seconds.
  var preview = /[?&]loader=preview/.test(location.search);
  if (!preview && (seen || document.readyState === "complete")) return;

  var shown = false;
  var shownAt = 0;
  var progress = 0;
  var target = 0.3;
  var loaded = false;
  var finished = false;

  function render(p) {
    var value = Math.round(p * 100);
    fill.style.transform = "scaleX(" + p + ")";
    drone.style.left = p * 100 + "%";
    pct.textContent = value + "%";
    loader.setAttribute("aria-valuenow", String(value));
  }

  function finish() {
    if (finished) return;
    finished = true;
    render(1);
    // Let the drone land at the end of the bar before the screen fades.
    setTimeout(function () {
      loader.classList.add("is-done");
    }, 350);
  }

  function tick() {
    if (finished) return;
    var visibleFor = Date.now() - shownAt;

    if (preview && !loaded) {
      // Demo: fill evenly over the 10 second hold.
      target = Math.min(0.97, visibleFor / 10000);
    } else if (!loaded) {
      // Keep creeping so the bar never looks stuck, but never claim "done".
      target = Math.min(0.9, target + 0.0015);
    }
    progress += (target - progress) * (loaded ? 0.14 : preview ? 0.2 : 0.05);

    if (loaded && visibleFor >= MIN_VISIBLE_MS && progress > 0.995) {
      finish();
      return;
    }
    render(Math.min(progress, 1));
    requestAnimationFrame(tick);
  }

  function show() {
    if (shown || loaded) return;
    shown = true;
    shownAt = Date.now();
    render(0);
    loader.classList.add("is-active");
    requestAnimationFrame(tick);
  }

  function markLoaded() {
    loaded = true;
    target = 1;
    // Loaded before the loader ever appeared: it never does.
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!preview) target = Math.max(target, 0.72);
  });
  if (preview) {
    show();
    setTimeout(markLoaded, 10000);
  } else {
    window.addEventListener("load", markLoaded);
    setTimeout(show, SHOW_AFTER_MS);
  }
  setTimeout(function () {
    if (shown) finish();
  }, FAILSAFE_MS);
})();

/* Contact page: the "What brings you here?" buttons pre-select the reason in
   the form below, then move the visitor to it. The form itself is handled by
   contact-form.js; changing the select fires its normal "change" handling
   (it unlocks the message box). */
(function () {
  var buttons = document.querySelectorAll(".inquiry[data-reason]");
  var select = document.getElementById("reason");
  if (!buttons.length || !select) return;

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      select.value = button.getAttribute("data-reason");
      select.dispatchEvent(new Event("change", { bubbles: true }));
      select.scrollIntoView({ behavior: "smooth", block: "center" });
      var message = document.getElementById("message");
      if (message) setTimeout(function () { message.focus({ preventScroll: true }); }, 400);
    });
  });
})();
