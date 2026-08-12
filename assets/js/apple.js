(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---------------------------- nav: scroll state --------------------------- */

  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 8);

    var bar = document.querySelector(".scroll-progress");
    if (bar) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct + "%";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
    document.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
      });
    });
  }

  /* ---------------------------- active nav link ------------------------------ */

  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------------------------- scroll reveal --------------------------------- */

  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var groups = {};
    revealEls.forEach(function (el) {
      var group = el.getAttribute("data-reveal-group") || "_";
      groups[group] = groups[group] || [];
      groups[group].push(el);
    });

    Object.keys(groups).forEach(function (key) {
      groups[key].forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i * 90, 360) + "ms";
      });
    });

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------- count-up stats --------------------------------- */

  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;

    if (reduceMotion || isNaN(target)) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
    } else {
      var countObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach(function (el) { countObserver.observe(el); });
    }
  }

  /* ---------------------------- card spotlight ---------------------------------- */

  if (!isTouch && !reduceMotion) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
        card.style.setProperty("--my", (e.clientY - rect.top) + "px");
      });
    });
  }

  /* ---------------------------- cursor glow -------------------------------------- */

  if (!isTouch && !reduceMotion) {
    var glow = document.querySelector(".cursor-glow");
    if (glow) {
      var gx = -999, gy = -999, cx = -999, cy = -999;
      window.addEventListener("mousemove", function (e) {
        gx = e.clientX;
        gy = e.clientY;
      });

      function raf() {
        cx += (gx - cx) * 0.12;
        cy += (gy - cy) * 0.12;
        glow.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }
})();
