/* ============================================================
   Giorgio Tsoupis — Interactive Résumé
   Vanilla JS. No third-party scripts, no tracking, no cookies.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Contact config (single source) ---- */
  var CONTACT = {
    waNumber: "48577654530",
    waMessage: "Hello Giorgio, I viewed your résumé and would like to discuss an opportunity.",
    email: "george@copilotadoption.uk",
    emailSubject: "Opportunity for Giorgio Tsoupis",
    emailBody: "Hello Giorgio, I viewed your résumé and would like to discuss an opportunity."
  };

  function waLink() {
    return "https://wa.me/" + CONTACT.waNumber + "?text=" + encodeURIComponent(CONTACT.waMessage);
  }
  function mailtoLink() {
    return "mailto:" + CONTACT.email +
      "?subject=" + encodeURIComponent(CONTACT.emailSubject) +
      "&body=" + encodeURIComponent(CONTACT.emailBody);
  }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---- Wire contact links ---- */
  document.addEventListener("DOMContentLoaded", function () {
    var wa = waLink(), mail = mailtoLink();

    ["ctaWhatsapp", "gateWhatsapp", "footerWhatsapp", "fabWhatsapp"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.setAttribute("href", wa);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
    });
    ["ctaEmail", "gateEmail", "footerEmail"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.setAttribute("href", mail);
    });

    // Hero + gate contact buttons also unlock the résumé
    ["ctaWhatsapp", "ctaEmail", "gateWhatsapp", "gateEmail"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("click", function () { unlockResume(); });
    });

    var skip = document.getElementById("gateSkip");
    if (skip) skip.addEventListener("click", function (e) { e.preventDefault(); unlockResume(true); });

    // Year
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    initReveals();
    initCounters();
    initHeaderState();
    initCursor();
    initProgress();
    initPdf();
    initHeroIntro();
  });

  /* ---- Résumé blur gate ---- */
  var resumeWrap = null;
  function getWrap() { if (!resumeWrap) resumeWrap = document.getElementById("resumeWrap"); return resumeWrap; }

  function lockResume() {
    var w = getWrap();
    if (w) w.classList.add("locked");
  }
  function unlockResume(scroll) {
    var w = getWrap();
    if (!w) return;
    if (w.classList.contains("locked")) {
      w.classList.remove("locked");
    }
    if (scroll) {
      var exp = document.getElementById("experience");
      if (exp) exp.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  }
  // Start locked
  lockResume();

  /* ---- Scroll reveals ---- */
  function initReveals() {
    var items = $all("[data-reveal]");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---- Count-up metrics ---- */
  function initCounters() {
    var els = $all("[data-count]");
    if (!els.length) return;

    function format(val, fmt) {
      if (fmt === "k") {
        if (val >= 1000) return Math.round(val / 1000) + "k";
      }
      return String(val);
    }

    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var fmt = el.getAttribute("data-format") || "";
      if (reduceMotion) { el.textContent = format(target, fmt) + suffix; return; }
      var dur = 1400, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var current = target * eased;
        var shown = fmt === "k" ? current : Math.round(current);
        el.textContent = format(Math.round(shown), fmt) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = format(target, fmt) + suffix;
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Header state on scroll ---- */
  function initHeaderState() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 24) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- Scroll progress bar ---- */
  function initProgress() {
    var bar = document.getElementById("progressBar");
    if (!bar) return;
    var onScroll = function () {
      var h = document.documentElement;
      var scrolled = h.scrollTop || document.body.scrollTop;
      var height = h.scrollHeight - h.clientHeight;
      var pct = height > 0 ? (scrolled / height) * 100 : 0;
      bar.style.width = pct + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- Custom cursor ---- */
  function initCursor() {
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    if (!dot || !ring) return;

    // Detect touch: hide cursor
    window.addEventListener("touchstart", function () {
      document.body.classList.add("using-touch");
    }, { once: true, passive: true });

    if (reduceMotion) return;

    var mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
    });
    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // Grow on interactive elements
    var hoverSel = "a, button, [data-cursor]";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) ring.classList.add("grow");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) ring.classList.remove("grow");
    });
  }

  /* ---- Hero intro ---- */
  function initHeroIntro() {
    var name = $(".hero-name");
    if (name) {
      // trigger the clip-reveal shortly after load
      window.requestAnimationFrame(function () {
        setTimeout(function () { name.classList.add("in"); }, reduceMotion ? 0 : 120);
      });
    }
  }

  /* ---- PDF export (print to PDF) ---- */
  function initPdf() {
    var handler = function (e) {
      if (e) e.preventDefault();
      unlockResume(); // ensure content is visible/unblurred before printing
      // allow the unblur transition to settle
      setTimeout(function () { window.print(); }, reduceMotion ? 0 : 260);
    };
    ["pdfBtn", "navPdf"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("click", handler);
    });
    // Safety: if user invokes browser print directly, make sure résumé is unblurred
    window.addEventListener("beforeprint", function () { unlockResume(); });
  }

})();
