(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var menuButton = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-links');
  var setMenu = function (open) {
    if (!menuButton || !menu) return;
    menu.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuButton.focus();
      }
    });
  }

  if (header) {
    var updateHeader = function () { header.classList.toggle('is-scrolled', window.scrollY > 24); };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  var range = document.getElementById('comparison-range');
  var comparison = document.getElementById('comparison-frame');
  if (range && comparison) {
    var setComparison = function (value) {
      var split = Math.max(Number(range.min), Math.min(Number(range.max), Math.round(value)));
      range.value = String(split);
      comparison.style.setProperty('--split', split + '%');
      range.setAttribute('aria-valuetext', split + ' percent finished photo');
    };
    var updateFromPointer = function (event) {
      var bounds = comparison.getBoundingClientRect();
      setComparison(((event.clientX - bounds.left) / bounds.width) * 100);
    };
    var activePointer = null;
    range.addEventListener('input', function () {
      setComparison(range.value);
    });
    comparison.addEventListener('pointerdown', function (event) {
      if (event.button !== 0) return;
      activePointer = event.pointerId;
      comparison.setPointerCapture(activePointer);
      updateFromPointer(event);
    });
    comparison.addEventListener('pointermove', function (event) {
      if (event.pointerId === activePointer) updateFromPointer(event);
    });
    comparison.addEventListener('pointerup', function (event) {
      if (event.pointerId === activePointer) activePointer = null;
    });
    comparison.addEventListener('pointercancel', function () {
      activePointer = null;
    });
    comparison.addEventListener('lostpointercapture', function () {
      activePointer = null;
    });
  }

  var gallery = document.querySelector('.gallery');
  var filters = document.querySelector('.gallery-filters');
  var count = document.getElementById('frame-count');
  var empty = document.querySelector('.gallery-empty');
  var activeFilter = 'all';
  var updateGallery = function () {
    if (!gallery) return;
    var visibleCount = 0;
    gallery.querySelectorAll('.shot').forEach(function (shot) {
      var isVisible = activeFilter === 'all' || shot.dataset.category === activeFilter;
      shot.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });
    if (count) count.innerHTML = String(visibleCount).padStart(2, '0') + ' <span>frames</span>';
    if (empty && visibleCount) empty.hidden = true;
    else if (empty && activeFilter !== 'all') {
      empty.textContent = 'No frames in this little corner yet. Try another filter?';
      empty.hidden = false;
    } else if (empty) {
      empty.textContent = 'No photos found in the studio library yet.';
      empty.hidden = false;
    }
  };
  updateGallery();
  if (filters) {
    filters.addEventListener('click', function (event) {
      var button = event.target.closest('[data-filter]');
      if (!button) return;
      activeFilter = button.dataset.filter;
      filters.querySelectorAll('[data-filter]').forEach(function (filter) {
        filter.setAttribute('aria-pressed', String(filter === button));
      });
      updateGallery();
    });
  }

  var safePhotoPath = function (file) {
    return file.split('/').map(encodeURIComponent).join('/');
  };
  var setLibraryPhoto = function (image, photo, alt) {
    if (!image || !photo) return;
    var imagePath = 'assets/photos/' + safePhotoPath(photo.file);
    image.alt = typeof alt === 'string' ? alt : photo.caption;
    if (image.dataset.libraryPhoto === 'featured') {
      var caption = image.closest('.hero-photo').querySelector('.photo-caption');
      if (caption) caption.textContent = photo.caption;
    }
    image.addEventListener('load', function () { image.classList.remove('is-unloaded'); }, { once: true });
    image.addEventListener('error', function () {
      image.classList.add('is-unloaded');
      console.error('Unable to load studio photo: ' + imagePath);
    }, { once: true });
    image.src = imagePath;
  };
  if (gallery && filters) {
    fetch('assets/photos/gallery.json')
      .then(function (response) {
        if (!response.ok) throw new Error('Photo manifest request failed: ' + response.status);
        return response.json();
      })
      .then(function (photos) {
        if (!Array.isArray(photos)) throw new Error('Photo manifest must be an array.');
        photos.forEach(function (photo, index) {
          if (!photo || typeof photo.file !== 'string' || typeof photo.caption !== 'string' ||
              typeof photo.category !== 'string' || typeof photo.categoryLabel !== 'string' ||
              !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(photo.category) ||
              !/^[A-Za-z0-9][A-Za-z0-9 _-]*(?:\/[A-Za-z0-9][A-Za-z0-9 _-]*)*\.(avif|webp|jpe?g|png|gif|bmp)$/i.test(photo.file)) {
            throw new Error('Photo manifest contains an invalid entry.');
          }
        });
        var featuredPhoto = photos[0];
        setLibraryPhoto(document.querySelector('[data-library-photo="featured"]'), featuredPhoto);
        setLibraryPhoto(document.querySelector('[data-library-photo="comparison-base"]'), featuredPhoto);
        setLibraryPhoto(document.querySelector('[data-library-photo="comparison-finish"]'), featuredPhoto, '');

        photos.forEach(function (photo, index) {
          var imagePath = 'assets/photos/' + safePhotoPath(photo.file);
          var figure = document.createElement('figure');
          figure.className = 'shot';
          figure.dataset.category = photo.category;
          var button = document.createElement('button');
          button.className = 'shot-open';
          button.type = 'button';
          button.setAttribute('aria-label', 'View larger: ' + photo.caption);
          var image = new Image();
          image.src = imagePath;
          image.alt = photo.caption;
          image.loading = 'lazy';
          image.decoding = 'async';
          image.addEventListener('error', function () {
            console.error('Unable to load studio photo: ' + imagePath);
            figure.remove();
            updateGallery();
          }, { once: true });
          var overlay = document.createElement('span');
          overlay.className = 'shot-overlay';
          var text = document.createElement('span');
          var category = document.createElement('small');
          category.textContent = photo.categoryLabel.toUpperCase();
          var title = document.createElement('strong');
          title.textContent = photo.caption;
          text.append(category, title);
          var zoom = document.createElement('span');
          zoom.className = 'zoom-icon';
          zoom.setAttribute('aria-hidden', 'true');
          zoom.textContent = '↗';
          overlay.append(text, zoom);
          button.append(image, overlay);
          var caption = document.createElement('figcaption');
          caption.append(document.createTextNode(photo.caption));
          var position = document.createElement('span');
          position.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(photos.length).padStart(2, '0');
          caption.appendChild(position);
          figure.append(button, caption);
          gallery.appendChild(figure);

          if (!filters.querySelector('[data-filter="' + photo.category + '"]')) {
            var filter = document.createElement('button');
            filter.className = 'filter-chip';
            filter.type = 'button';
            filter.dataset.filter = photo.category;
            filter.setAttribute('aria-pressed', 'false');
            filter.textContent = photo.categoryLabel;
            filters.appendChild(filter);
          }
        });
        if (empty) {
          empty.textContent = photos.length ? 'No frames in this little corner yet. Try another filter?' : 'No photos found in the studio library yet.';
        }
        updateGallery();
      })
      .catch(function (error) {
        console.error('Unable to load additional gallery photos.', error);
        if (empty) {
          empty.textContent = 'The studio photos could not load just now. Please try again later.';
          empty.hidden = false;
        }
      });
  }

  var lightbox = document.getElementById('lightbox');
  if (gallery && lightbox && typeof lightbox.showModal === 'function') {
    var lightboxImage = lightbox.querySelector('.lb-img');
    var lightboxCaption = lightbox.querySelector('.lb-caption');
    var lightboxCount = lightbox.querySelector('.lb-count');
    var previous = lightbox.querySelector('.lb-prev');
    var next = lightbox.querySelector('.lb-next');
    var close = lightbox.querySelector('.lb-close');
    var openButtons = [];
    var currentIndex = 0;
    var previousFocus = null;
    var renderPhoto = function () {
      var button = openButtons[currentIndex];
      var image = button.querySelector('img');
      var figure = button.closest('.shot');
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      lightboxCaption.textContent = figure.querySelector('figcaption').textContent;
      lightboxCount.textContent = (currentIndex + 1) + ' / ' + openButtons.length;
      previous.hidden = openButtons.length < 2;
      next.hidden = openButtons.length < 2;
    };
    var movePhoto = function (step) {
      if (openButtons.length < 2) return;
      currentIndex = (currentIndex + step + openButtons.length) % openButtons.length;
      renderPhoto();
    };
    gallery.addEventListener('click', function (event) {
      var button = event.target.closest('.shot-open');
      if (!button) return;
      openButtons = Array.prototype.slice.call(gallery.querySelectorAll('.shot:not([hidden]) .shot-open'));
      currentIndex = Math.max(0, openButtons.indexOf(button));
      previousFocus = button;
      renderPhoto();
      lightbox.showModal();
      close.focus();
    });
    close.addEventListener('click', function () { lightbox.close(); });
    previous.addEventListener('click', function () { movePhoto(-1); });
    next.addEventListener('click', function () { movePhoto(1); });
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') movePhoto(-1);
      if (event.key === 'ArrowRight') movePhoto(1);
      if (event.key === 'Escape') lightbox.close();
    });
    lightbox.addEventListener('close', function () {
      if (previousFocus && previousFocus.isConnected) previousFocus.focus();
    });
    var touchStartX = null;
    lightbox.addEventListener('touchstart', function (event) {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (event) {
      if (touchStartX === null) return;
      var distance = event.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(distance) > 48) movePhoto(distance < 0 ? 1 : -1);
    }, { passive: true });
  }

  var select = document.getElementById('f-type');
  document.querySelectorAll('[data-type]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (select) select.value = link.dataset.type;
    });
  });

  var form = document.getElementById('enquiry');
  var status = document.getElementById('form-status');
  if (form && status) {
    var fields = [
      { input: document.getElementById('f-name'), error: document.getElementById('name-error'), message: 'Tell us your name so we know what to call you.' },
      { input: document.getElementById('f-email'), error: document.getElementById('email-error'), message: 'Add a valid email address so we can write back.' },
      { input: document.getElementById('f-type'), error: document.getElementById('type-error'), message: 'Choose what we’ll be shooting together.' },
      { input: document.getElementById('f-message'), error: document.getElementById('message-error'), message: 'A few words about what you’re picturing would be lovely.' }
    ];
    var validateField = function (field) {
      var valid = field.input.checkValidity();
      field.input.setAttribute('aria-invalid', String(!valid));
      field.error.textContent = valid ? '' : field.message;
      return valid;
    };
    fields.forEach(function (field) {
      field.input.addEventListener('blur', function () {
        if (field.input.value || field.input.dataset.touched) {
          field.input.dataset.touched = 'true';
          validateField(field);
        }
      });
      field.input.addEventListener('input', function () {
        if (field.input.dataset.touched) validateField(field);
      });
      field.input.addEventListener('change', function () {
        if (field.input.dataset.touched) validateField(field);
      });
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var valid = fields.map(validateField).every(Boolean);
      if (!valid) {
        status.classList.add('is-error');
        status.textContent = 'A couple of details need a little love before we can write your email.';
        var firstInvalid = fields.find(function (field) { return !field.input.checkValidity(); });
        if (firstInvalid) firstInvalid.input.focus();
        return;
      }
      status.classList.remove('is-error');
      var button = form.querySelector('.submit-btn');
      var label = button.querySelector('.submit-label');
      var data = new FormData(form);
      var subject = 'StayTilted shoot enquiry: ' + data.get('type');
      var body = [
        'Name: ' + data.get('name'),
        'Email: ' + data.get('email'),
        'What we are shooting: ' + data.get('type'),
        'Date: ' + (data.get('date') || 'Flexible'),
        '',
        'What I am picturing:',
        data.get('message')
      ].join('\n');
      button.disabled = true;
      label.textContent = 'Sending your note…';
      status.textContent = '';
      window.setTimeout(function () {
        window.location.href = 'mailto:' + form.dataset.email +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);
        label.textContent = 'Email draft is ready';
        button.disabled = false;
        status.textContent = 'Your email app should open with your note ready to send. Nothing is sent until you hit send there.';
      }, reduceMotion ? 0 : 350);
    });
  }
})();
