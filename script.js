(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var header = document.querySelector('.site-header');
  var gallery = document.querySelector('.gallery');
  var filters = document.querySelector('.gallery-filters');

  /* Footer year */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* Mobile navigation */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  var setMenu = function (open) {
    if (!toggle || !links) return;
    links.classList.toggle('open', open);
    if (header) header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  };
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      setMenu(!links.classList.contains('open'));
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* Hero headline: each word rises out of a mask. Plain text stays if motion is reduced. */
  var h1 = document.querySelector('h1.reveal');
  if (h1 && !reduceMotion) {
    var headline = h1.textContent.trim();
    var words = headline.split(/\s+/);
    h1.setAttribute('aria-label', headline);
    h1.textContent = '';
    words.forEach(function (word, i) {
      var mask = document.createElement('span');
      mask.className = 'w';
      mask.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('span');
      inner.style.setProperty('--w', String(i));
      inner.textContent = word;
      mask.appendChild(inner);
      h1.appendChild(mask);
      if (i < words.length - 1) h1.appendChild(document.createTextNode(' '));
    });
    h1.classList.add('has-split');
  }

  /* Scroll reveal: staggered entrance, once. Also used for photos added later from the library. */
  var io = null;
  if ('IntersectionObserver' in window && !reduceMotion) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  }
  var observeReveal = function (el) {
    if (io) io.observe(el);
    else el.classList.add('in');
  };
  document.querySelectorAll('.reveal').forEach(observeReveal);

  /* One scroll handler: frosted header, plus the hero frame straightening (transform only) */
  var hero = document.getElementById('hero-frame');
  var ticking = false;
  var onScroll = function () {
    ticking = false;
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (hero && !reduceMotion) {
      var p = Math.min(y / (window.innerHeight * 0.7), 1);
      hero.style.setProperty('--hero-tilt', (-5 * (1 - p)).toFixed(2) + 'deg');
    }
  };
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* Hero: the frame and the heart drift a few pixels against each other with the pointer */
  var heroSection = document.querySelector('.hero');
  var heroArt = document.querySelector('.hero-art');
  if (heroSection && heroArt && !reduceMotion && finePointer) {
    var pointerQueued = false, px = 0, py = 0;
    var applyPointer = function () {
      pointerQueued = false;
      heroArt.style.setProperty('--mx', px.toFixed(3));
      heroArt.style.setProperty('--my', py.toFixed(3));
    };
    heroSection.addEventListener('pointermove', function (e) {
      px = (e.clientX / window.innerWidth - 0.5) * 2;
      py = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!pointerQueued) { pointerQueued = true; requestAnimationFrame(applyPointer); }
    });
    heroSection.addEventListener('pointerleave', function () {
      px = 0; py = 0;
      applyPointer();
    });
  }

  /* Nav shows which section you are in */
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window && navAnchors.length) {
    var byId = {};
    navAnchors.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = byId[entry.target.id];
        if (!a) return;
        if (entry.isIntersecting) {
          navAnchors.forEach(function (x) { x.removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
        } else if (a.getAttribute('aria-current')) {
          a.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
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

  /* Gallery photos get an invisible "open" button once a real photo is in the frame */
  var addOpener = function (figure) {
    if (!figure.classList.contains('shot')) return;
    var holder = figure.querySelector('.frame');
    if (!holder || holder.querySelector('.frame-open')) return;
    var figcap = figure.querySelector('figcaption');
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'frame-open';
    button.setAttribute('aria-label', 'View larger: ' + (figcap ? figcap.textContent : 'photo'));
    holder.appendChild(button);
  };

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
        img.className = 'ph ph-swap';
        img.alt = alt;
        img.decoding = 'async';
        img.loading = 'lazy';
        holder.replaceWith(img);
        addOpener(fig);
      };
      img.onerror = function () { tryExt(i + 1); };
      img.src = 'assets/photos/' + name + '.' + exts[i];
    })(0);
  });

  /* Filters. Photos that change category re-enter with a small stagger. */
  var activeFilter = 'all';
  var applyFilter = function (animate) {
    if (!gallery) return;
    var visible = 0;
    gallery.querySelectorAll('.shot').forEach(function (shot) {
      shot.hidden = activeFilter !== 'all' && shot.getAttribute('data-category') !== activeFilter;
      if (shot.hidden) return;
      if (animate && !reduceMotion) {
        shot.classList.remove('refresh');
        void shot.offsetWidth;
        shot.style.setProperty('--d', Math.min(visible, 8) * 45 + 'ms');
        shot.classList.add('refresh');
      }
      visible += 1;
    });
    var emptyMessage = document.querySelector('.gallery-empty');
    if (emptyMessage) emptyMessage.hidden = visible !== 0;
  };
  if (gallery) {
    gallery.addEventListener('animationend', function (e) {
      if (e.animationName === 'shot-in') e.target.classList.remove('refresh');
    });
  }

  /* Additional gallery photos are listed in the manifest published from the photo library. */
  if (gallery && filters && window.location.protocol !== 'file:') {
    filters.addEventListener('click', function (e) {
      var button = e.target.closest('[data-filter]');
      if (!button || !filters.contains(button)) return;
      activeFilter = button.getAttribute('data-filter');
      filters.querySelectorAll('[data-filter]').forEach(function (filter) {
        filter.setAttribute('aria-pressed', String(filter === button));
      });
      applyFilter(true);
    });

    var tilts = [-1.4, 1.6, -0.8, 1.2, -1.8, 0.9];
    var extraCount = 0;

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
          figure.className = 'shot shot--extra reveal';
          figure.style.setProperty('--r', tilts[extraCount % tilts.length] + 'deg');
          figure.style.setProperty('--i', String(extraCount % 3));
          figure.setAttribute('data-category', photo.category);
          var imageFrame = document.createElement('div');
          imageFrame.className = 'frame is-loading';
          imageFrame.style.setProperty('--ratio', '4 / 5');
          var image = new Image();
          image.className = 'ph';
          image.alt = photo.caption;
          image.decoding = 'async';
          image.loading = 'lazy';
          image.onload = function () {
            imageFrame.classList.remove('is-loading');
            addOpener(figure);
          };
          image.onerror = function () {
            figure.remove();
            applyFilter(false);
          };
          image.src = 'assets/photos/' + photo.file.split('/').map(encodeURIComponent).join('/');
          imageFrame.appendChild(image);
          var figcap = document.createElement('figcaption');
          figcap.textContent = photo.caption;
          figure.appendChild(imageFrame);
          figure.appendChild(figcap);
          gallery.appendChild(figure);
          observeReveal(figure);
          existing[photo.file] = true;
          extraCount += 1;

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
        applyFilter(false);
      })
      .catch(function (error) {
        console.error('Unable to load additional gallery photos.', error);
      });
  }

  /* Photo viewer: arrows, swipe and Esc, moving through whatever the current filter shows */
  var lb = document.getElementById('lightbox');
  if (gallery && lb && typeof lb.showModal === 'function') {
    var lbImg = lb.querySelector('.lb-img');
    var lbCap = lb.querySelector('.lb-cap');
    var lbCount = lb.querySelector('.lb-count');
    var lbPrev = lb.querySelector('.lb-prev');
    var lbNext = lb.querySelector('.lb-next');
    var openers = [];
    var index = 0;

    var render = function () {
      var figure = openers[index].closest('.shot');
      var img = figure.querySelector('img.ph');
      var figcap = figure.querySelector('figcaption');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = figcap ? figcap.textContent : '';
      lbCount.textContent = (index + 1) + ' / ' + openers.length;
      lbPrev.hidden = openers.length < 2;
      lbNext.hidden = openers.length < 2;
    };
    var go = function (step) {
      if (openers.length < 2) return;
      index = (index + step + openers.length) % openers.length;
      render();
    };

    gallery.addEventListener('click', function (e) {
      var button = e.target.closest('.frame-open');
      if (!button) return;
      openers = Array.prototype.slice.call(gallery.querySelectorAll('.shot:not([hidden]) .frame-open'));
      index = Math.max(0, openers.indexOf(button));
      render();
      lb.showModal();
    });
    lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
    lbPrev.addEventListener('click', function () { go(-1); });
    lbNext.addEventListener('click', function () { go(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    });

    var startX = null;
    lb.addEventListener('touchstart', function (e) { startX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    }, { passive: true });
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

  /* Enquiry form opens a written email, and says so */
  var form = document.getElementById('enquiry');
  var status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var subject = 'Enquiry: ' + d.get('type') + ' (' + d.get('name') + ')';
      var body = 'Name: ' + d.get('name') + '\nEmail: ' + d.get('email') + '\nBooking: ' + d.get('type') + '\n\n' + d.get('message');
      if (status) status.textContent = 'Opening your email app with the enquiry ready to send. Nothing happened? Write to ' + form.dataset.email + ' directly.';
      window.location.href = 'mailto:' + form.dataset.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }
})();
