(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js-ready'); /* tells the head script we loaded, so reveals stay armed */

  /* Footer year */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* Mobile navigation */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a') && links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
      }
    });
  }

  /* Scroll reveal: staggered entrance, once */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* Hero frame straightens as you scroll (transform only) */
  var hero = document.getElementById('hero-frame');
  if (hero && !reduceMotion) {
    var ticking = false;
    var update = function () {
      var p = Math.min(window.scrollY / (window.innerHeight * 0.7), 1);
      hero.style.rotate = (-5 * (1 - p)).toFixed(2) + 'deg';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* "Level it": the one live thing */
  var range = document.getElementById('level-range');
  var frame = document.getElementById('level-frame');
  var caption = document.getElementById('level-caption');
  if (range && frame && caption) {
    var setTilt = function () {
      var v = Number(range.value);
      frame.style.rotate = v + 'deg';
      caption.textContent = v === 0 ? 'Perfectly level. A bit dull, honestly.' : 'Tilted ' + Math.abs(v) + '°. Better.';
    };
    range.addEventListener('input', setTilt);
    setTilt();
  }

  /* Real photos: drop photo-hero, photo-01 ... photo-05, photo-level
     (.jpg or .webp) into assets/photos and they replace the drawn placeholders. */
  var exts = ['jpg', 'webp'];
  document.querySelectorAll('[data-photo]').forEach(function (fig) {
    var name = fig.getAttribute('data-photo');
    var alt = fig.getAttribute('data-alt') || '';
    var holder = fig.querySelector('.ph');
    if (!holder) return;
    (function tryExt(i) {
      if (i >= exts.length) return;
      var img = new Image();
      img.onload = function () {
        img.className = 'ph';
        img.alt = alt;
        img.decoding = 'async';
        img.loading = 'lazy';
        holder.replaceWith(img);
      };
      img.onerror = function () { tryExt(i + 1); };
      img.src = 'assets/photos/' + name + '.' + exts[i];
    })(0);
  });

  /* Service links pre-select the shoot type in the form */
  var select = document.getElementById('f-type');
  document.querySelectorAll('[data-type]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (!select) return;
      var t = a.getAttribute('data-type');
      Array.prototype.forEach.call(select.options, function (o) { if (o.text === t) select.value = o.value || o.text; });
    });
  });

  /* Enquiry form opens a written email */
  var form = document.getElementById('enquiry');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var subject = 'Enquiry: ' + d.get('type') + ' (' + d.get('name') + ')';
      var body = 'Name: ' + d.get('name') + '\nEmail: ' + d.get('email') + '\nBooking: ' + d.get('type') + '\n\n' + d.get('message');
      window.location.href = 'mailto:' + form.dataset.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }
})();
