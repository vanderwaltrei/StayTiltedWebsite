(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      hero.style.setProperty('--hero-tilt', (-5 * (1 - p)).toFixed(2) + 'deg');
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
      frame.style.setProperty('--tilt', v + 'deg');
      caption.textContent = v === 0 ? 'Perfectly level. A bit dull, honestly.' : 'Tilted ' + Math.abs(v) + '°. Better.';
    };
    range.addEventListener('input', setTilt);
    setTilt();
  }

  /* Fixed photo slots use matching names in assets/photos. */
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

  /* Additional gallery photos are listed in the manifest published from the photo library. */
  var gallery = document.querySelector('.gallery');
  var filters = document.querySelector('.gallery-filters');
  if (gallery && filters && window.location.protocol !== 'file:') {
    var activeFilter = 'all';
    var applyFilter = function () {
      var visible = 0;
      gallery.querySelectorAll('.shot').forEach(function (shot) {
        shot.hidden = activeFilter !== 'all' && shot.getAttribute('data-category') !== activeFilter;
        if (!shot.hidden) visible += 1;
      });
      var emptyMessage = document.querySelector('.gallery-empty');
      if (emptyMessage) emptyMessage.hidden = visible !== 0;
    };
    filters.addEventListener('click', function (e) {
      var button = e.target.closest('[data-filter]');
      if (!button || !filters.contains(button)) return;
      activeFilter = button.getAttribute('data-filter');
      filters.querySelectorAll('[data-filter]').forEach(function (filter) {
        filter.setAttribute('aria-pressed', String(filter === button));
      });
      applyFilter();
    });

    fetch('assets/photos/gallery.json')
      .then(function (response) {
        if (!response.ok) throw new Error('Photo manifest request failed: ' + response.status);
        return response.json();
      })
      .then(function (photos) {
        if (!Array.isArray(photos)) throw new Error('Photo manifest must be an array.');
        var existing = {};
        document.querySelectorAll('[data-photo]').forEach(function (fig) {
          existing[fig.getAttribute('data-photo')] = true;
        });
        photos.forEach(function (photo) {
          if (!photo || typeof photo.file !== 'string' || typeof photo.caption !== 'string' ||
              typeof photo.category !== 'string' || typeof photo.categoryLabel !== 'string' ||
              !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(photo.category) ||
              !/^[A-Za-z0-9][A-Za-z0-9_-]*(?:\/[A-Za-z0-9][A-Za-z0-9_-]*)*\.(jpg|webp)$/i.test(photo.file)) {
            throw new Error('Photo manifest contains an invalid entry.');
          }
          if (existing[photo.file]) return;

          var figure = document.createElement('figure');
          figure.className = 'shot shot--extra';
          figure.setAttribute('data-category', photo.category);
          var imageFrame = document.createElement('div');
          imageFrame.className = 'frame';
          imageFrame.style.setProperty('--ratio', '4 / 5');
          var image = new Image();
          image.className = 'ph';
          image.alt = photo.caption;
          image.decoding = 'async';
          image.loading = 'lazy';
          image.src = 'assets/photos/' + photo.file.split('/').map(encodeURIComponent).join('/');
          imageFrame.appendChild(image);
          var caption = document.createElement('figcaption');
          caption.textContent = photo.caption;
          figure.appendChild(imageFrame);
          figure.appendChild(caption);
          gallery.appendChild(figure);
          existing[photo.file] = true;

          if (!filters.querySelector('[data-filter="' + photo.category + '"]')) {
            var filter = document.createElement('button');
            filter.className = 'gallery-filter';
            filter.type = 'button';
            filter.setAttribute('data-filter', photo.category);
            filter.setAttribute('aria-pressed', 'false');
            filter.textContent = photo.categoryLabel;
            filters.appendChild(filter);
          }
        });
        applyFilter();
      })
      .catch(function (error) {
        console.error('Unable to load additional gallery photos.', error);
      });
  }

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
