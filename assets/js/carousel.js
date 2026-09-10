/* ==========================================================================
   Texas Aerial Robotics — carousel
   --------------------------------------------------------------------------
   Turns a row of cards into a sideways carousel that scrolls by itself and
   can also be driven by hand.

   The markup it looks for:

     <div class="carousel" data-carousel data-carousel-interval="5000">
       <div class="carousel__track">
         <article>...</article>
         <article>...</article>
       </div>
       <div class="carousel__controls">
         <button class="carousel__button" data-carousel-prev>...</button>
         <div class="carousel__dots" data-carousel-dots></div>
         <button class="carousel__button" data-carousel-next>...</button>
       </div>
     </div>

   `data-carousel-interval` is how many milliseconds to wait between
   automatic moves. Leave it out and it defaults to 5000 (five seconds).
   The dots are generated here, so you never have to keep their count in
   sync with the number of cards.

   Autoplay stops while the visitor is hovering, dragging, tabbing through
   the cards, or looking at another browser tab. It never runs at all for
   visitors who have asked their system for reduced motion.
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function setUpCarousel(root) {
    var track = root.querySelector(".carousel__track");
    if (!track) {
      return;
    }

    var slides = Array.prototype.slice.call(track.children);
    if (slides.length === 0) {
      return;
    }

    var previousButton = root.querySelector("[data-carousel-prev]");
    var nextButton = root.querySelector("[data-carousel-next]");
    var dotsHolder = root.querySelector("[data-carousel-dots]");
    var interval = Number(root.dataset.carouselInterval) || 5000;

    var dots = [];
    var timer = null;
    var paused = false;

    /* How far one card sits from the next, including the gap. */
    function step() {
      if (slides.length < 2) {
        return track.clientWidth;
      }
      return slides[1].offsetLeft - slides[0].offsetLeft;
    }

    /* The number of resting positions. With six cards and three on screen
       there are four, not six, because the last card cannot become the
       leftmost one. */
    function positionCount() {
      var visible = Math.max(1, Math.round(track.clientWidth / step()));
      return Math.max(1, slides.length - visible + 1);
    }

    function currentPosition() {
      return Math.round(track.scrollLeft / step());
    }

    function goTo(index) {
      var total = positionCount();
      var target = ((index % total) + total) % total;
      track.scrollTo({ left: target * step(), behavior: "smooth" });
    }

    /* ------------------------------------------------------------------
       Dots
       ------------------------------------------------------------------ */

    function buildDots() {
      if (!dotsHolder) {
        return;
      }

      dotsHolder.innerHTML = "";
      dots = [];

      var total = positionCount();
      if (total < 2) {
        return;
      }

      for (var i = 0; i < total; i++) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel__dot";
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener(
          "click",
          (function (index) {
            return function () {
              goTo(index);
              restart();
            };
          })(i)
        );
        dotsHolder.appendChild(dot);
        dots.push(dot);
      }
    }

    /* Keeps the dots and the arrow buttons in step with the scroll
       position. Called whenever the track moves. */
    function syncControls() {
      var position = currentPosition();

      dots.forEach(function (dot, index) {
        var active = index === position;
        dot.classList.toggle("is-active", active);
        if (active) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    /* ------------------------------------------------------------------
       Autoplay
       ------------------------------------------------------------------ */

    function stop() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (prefersReducedMotion || paused || positionCount() < 2) {
        return;
      }
      timer = window.setInterval(function () {
        goTo(currentPosition() + 1);
      }, interval);
    }

    /* Used after a manual interaction, so the visitor gets a full interval
       to read the card they just moved to. */
    function restart() {
      start();
    }

    function pause() {
      paused = true;
      stop();
    }

    function resume() {
      paused = false;
      start();
    }

    /* ------------------------------------------------------------------
       Wiring
       ------------------------------------------------------------------ */

    if (previousButton) {
      previousButton.addEventListener("click", function () {
        goTo(currentPosition() - 1);
        restart();
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        goTo(currentPosition() + 1);
        restart();
      });
    }

    root.addEventListener("mouseenter", pause);
    root.addEventListener("mouseleave", resume);
    root.addEventListener("focusin", pause);
    root.addEventListener("focusout", function (event) {
      if (!root.contains(event.relatedTarget)) {
        resume();
      }
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else if (!paused) {
        start();
      }
    });

    /* Scroll events fire in bursts, so wait for them to settle before
       redrawing the dots. */
    var scrollSettleTimer = null;
    track.addEventListener("scroll", function () {
      window.clearTimeout(scrollSettleTimer);
      scrollSettleTimer = window.setTimeout(syncControls, 80);
    });

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        buildDots();
        syncControls();
        start();
      }, 150);
    });

    /* Click-and-drag with a mouse. Touch screens already do this natively,
       so this only runs for a pointer. */
    var dragStartX = 0;
    var dragStartScroll = 0;
    var dragging = false;

    track.addEventListener("pointerdown", function (event) {
      if (event.pointerType !== "mouse") {
        return;
      }
      dragging = true;
      dragStartX = event.clientX;
      dragStartScroll = track.scrollLeft;
      track.classList.add("is-dragging");
      pause();
    });

    track.addEventListener("pointermove", function (event) {
      if (!dragging) {
        return;
      }
      event.preventDefault();
      track.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
    });

    function endDrag() {
      if (!dragging) {
        return;
      }
      dragging = false;
      track.classList.remove("is-dragging");
      goTo(currentPosition());
      resume();
    }

    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("pointerleave", endDrag);

    buildDots();
    syncControls();
    start();
  }

  document.querySelectorAll("[data-carousel]").forEach(setUpCarousel);
})();
