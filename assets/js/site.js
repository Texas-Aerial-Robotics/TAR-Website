/* ==========================================================================
   Texas Aerial Robotics — shared site behaviour
   --------------------------------------------------------------------------
   Three small things happen in this file:
     1. The mobile menu button opens and closes the navigation.
     2. Elements with class "reveal" fade in as you scroll to them.
     3. Any element with id "year" gets the current year (used in the footer).

   This runs on every page. It has no dependencies.
   ========================================================================== */

(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     1. Mobile navigation
     ---------------------------------------------------------------------- */

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close the menu after tapping a link.
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // Close the menu with the Escape key.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ----------------------------------------------------------------------
     2. Fade-in on scroll

     Add class="reveal" to any element you want to animate in.
     ---------------------------------------------------------------------- */

  var revealables = document.querySelectorAll(".reveal");
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    // No observer support (or the visitor asked for less motion):
    // just show everything straight away.
    revealables.forEach(function (element) {
      element.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealables.forEach(function (element, index) {
      // Stagger siblings slightly so groups of cards cascade in.
      element.style.transitionDelay = (index % 4) * 70 + "ms";
      observer.observe(element);
    });
  }

  /* ----------------------------------------------------------------------
     3. Current year in the footer
     ---------------------------------------------------------------------- */

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
