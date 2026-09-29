/**
 * MALABARÉ — The Soul of Malabar, Served Beautifully
 * Vanilla JavaScript Core Engine
 * Kowdiar, Thiruvananthapuram | BRUK Digital Studio
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. Sticky Navigation & Scroll Spy
  // =========================================================================
  const siteHeader = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('section[id]');
  const backToTopBtn = document.querySelector('.back-to-top');

  function handleScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Sticky header class
    if (siteHeader) {
      if (scrollY > 50) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    // Back to top visibility
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // Scroll spy for active section highlight
    const scrollPos = scrollY + 150;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}` || link.getAttribute('href') === `index.html#${id}`) {
            link.classList.add('active');
          } else if (link.getAttribute('href')?.startsWith('#')) {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  // Back to top click handler
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // =========================================================================
  // 2. Mobile Drawer Navigation
  // =========================================================================
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileBackdrop = document.querySelector('.mobile-drawer-backdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-drawer .btn');

  function openMobileNav() {
    if (mobileDrawer && mobileToggle && mobileBackdrop) {
      mobileDrawer.classList.add('open');
      mobileToggle.classList.add('open');
      mobileBackdrop.classList.add('open');
      mobileToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileNav() {
    if (mobileDrawer && mobileToggle && mobileBackdrop) {
      mobileDrawer.classList.remove('open');
      mobileToggle.classList.remove('open');
      mobileBackdrop.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', closeMobileNav);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // Smooth scroll for all hash anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // =========================================================================
  // 3. Scroll Reveal Animations (Intersection Observer)
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('active'));
  }

  // =========================================================================
  // 4. Interactive Menu Category Filtering & Search
  // =========================================================================
  const menuFilterButtons = document.querySelectorAll('.menu-filter-btn');
  const menuItems = document.querySelectorAll('.menu-item-row, .menu-card-full, .dish-card');
  const menuSearchInput = document.querySelector('.menu-search-input');

  function filterMenuItems(category, query = '') {
    const cleanQuery = query.trim().toLowerCase();

    menuItems.forEach(item => {
      const title = (item.querySelector('.menu-item-title, .dish-title')?.textContent || '').toLowerCase();
      const desc = (item.querySelector('.menu-item-desc, .dish-description')?.textContent || '').toLowerCase();
      const native = (item.querySelector('.menu-item-native, .dish-native-name')?.textContent || '').toLowerCase();
      const itemCategory = item.getAttribute('data-category') || (
        title.includes('biryani') ? 'biryani' :
        title.includes('pudding') ? 'desserts' :
        title.includes('fish') || title.includes('karimeen') ? 'classics seafood' :
        title.includes('prawn') ? 'starters seafood' :
        title.includes('chicken') ? 'starters classics' : ''
      );
      const itemCategories = itemCategory.split(' ');

      const matchesCategory = (category === 'all' || itemCategories.includes(category));
      const matchesSearch = cleanQuery === '' || title.includes(cleanQuery) || desc.includes(cleanQuery) || native.includes(cleanQuery);

      if (matchesCategory && matchesSearch) {
        item.style.display = '';
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 30);
      } else {
        item.style.opacity = '0';
        item.style.transform = 'translateY(15px)';
        setTimeout(() => {
          item.style.display = 'none';
        }, 250);
      }
    });
  }

  menuFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      menuFilterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const selectedCategory = btn.getAttribute('data-filter');
      const currentQuery = menuSearchInput ? menuSearchInput.value : '';
      filterMenuItems(selectedCategory, currentQuery);
    });
  });

  if (menuSearchInput) {
    menuSearchInput.addEventListener('input', (e) => {
      const activeBtn = document.querySelector('.menu-filter-btn.active');
      const currentCategory = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
      filterMenuItems(currentCategory, e.target.value);
    });
  }

  // =========================================================================
  // 5. Gallery Lightbox Modal
  // =========================================================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.querySelector('.lightbox-modal');
  const lightboxImg = document.querySelector('.lightbox-img');
  const lightboxCaption = document.querySelector('.lightbox-caption');
  const lightboxCounter = document.querySelector('.lightbox-counter');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');

  let currentGalleryIndex = 0;
  const galleryData = [];

  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    const title = item.getAttribute('data-title') || img?.getAttribute('alt') || 'MALABARÉ Culinary Art';
    const category = item.getAttribute('data-category') || 'Fine Dining';
    const src = img?.getAttribute('src') || '';

    galleryData.push({ src, title, category });

    item.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  function updateLightbox() {
    if (!lightboxImg || !galleryData[currentGalleryIndex]) return;
    const data = galleryData[currentGalleryIndex];
    lightboxImg.src = data.src;
    lightboxImg.alt = data.title;
    if (lightboxCaption) lightboxCaption.textContent = data.title;
    if (lightboxCounter) lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${galleryData.length}`;
  }

  function openLightbox(index) {
    if (!lightboxModal) return;
    currentGalleryIndex = index;
    updateLightbox();
    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function nextLightbox() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryData.length;
    updateLightbox();
  }

  function prevLightbox() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
    updateLightbox();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', nextLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightbox);

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal || e.target.classList.contains('lightbox-container')) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!lightboxModal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
    });
  }

  // =========================================================================
  // 6. Reservation Form Handling & Validation
  // =========================================================================
  const reservationForms = document.querySelectorAll('.reservation-form');
  const confirmationModal = document.querySelector('#reservationConfirmationModal');
  const modalCloseButtons = document.querySelectorAll('.modal-close-trigger');

  // Enforce today as minimum reservation date
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const localToday = new Date();
  const todayStr = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, '0')}-${String(localToday.getDate()).padStart(2, '0')}`;
  dateInputs.forEach(input => {
    input.setAttribute('min', todayStr);
    if (!input.value) {
      input.value = todayStr;
    }
  });

  // Seating choice buttons on reservation.html
  const seatingButtons = document.querySelectorAll('.seating-choice-btn');
  const seatingInput = document.querySelector('#seatingAreaInput');
  if (seatingButtons.length > 0 && seatingInput) {
    seatingButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        seatingButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        seatingInput.value = btn.getAttribute('data-area');
      });
    });
  }

  reservationForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let isValid = true;
      const nameInput = form.querySelector('[name="name"]');
      const phoneInput = form.querySelector('[name="phone"]');
      const emailInput = form.querySelector('[name="email"]');
      const dateInput = form.querySelector('[name="date"]');
      const timeInput = form.querySelector('[name="time"]');
      const guestsInput = form.querySelector('[name="guests"]');
      const seatingArea = form.querySelector('[name="seating"]') || { value: 'Main Teak Hall' };
      const requestsInput = form.querySelector('[name="special_requests"]');

      // Helper validation
      function setFieldError(field, hasError, message) {
        const group = field.closest('.form-group');
        if (!group) return;
        if (hasError) {
          group.classList.add('has-error');
          let errSpan = group.querySelector('.form-error');
          if (errSpan && message) errSpan.textContent = message;
          isValid = false;
        } else {
          group.classList.remove('has-error');
        }
      }

      // 1. Name validation
      if (nameInput) {
        if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
          setFieldError(nameInput, true, 'Please provide your full name');
        } else {
          setFieldError(nameInput, false);
        }
      }

      // 2. Phone validation
      if (phoneInput) {
        const phoneRegex = /^[+]?[\d\s()\-]{8,20}$/;
        if (!phoneRegex.test(phoneInput.value.trim())) {
          setFieldError(phoneInput, true, 'Please enter a valid telephone number');
        } else {
          setFieldError(phoneInput, false);
        }
      }

      // 3. Email validation
      if (emailInput) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
          setFieldError(emailInput, true, 'Please enter a valid email address');
        } else {
          setFieldError(emailInput, false);
        }
      }

      // 4. Date validation
      if (dateInput) {
        if (!dateInput.value) {
          setFieldError(dateInput, true, 'Please select your preferred date');
        } else {
          setFieldError(dateInput, false);
        }
      }

      // 5. Time validation
      if (timeInput) {
        if (!timeInput.value) {
          setFieldError(timeInput, true, 'Please select your dining time');
        } else {
          setFieldError(timeInput, false);
        }
      }

      // 6. Guests validation
      if (guestsInput) {
        if (!guestsInput.value || parseInt(guestsInput.value, 10) < 1) {
          setFieldError(guestsInput, true, 'Please indicate number of guests');
        } else {
          setFieldError(guestsInput, false);
        }
      }

      if (!isValid) {
        showToast('Please verify the highlighted fields before submitting.', 'error');
        return;
      }

      // Button loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation: spin 1s linear infinite; width:18px; height:18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg> Confirming Reservation...
      `;

      try {
        const formData = Object.fromEntries(new FormData(form).entries());
        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Reservation could not be saved.');

        const reservationData = result.reservation;
        if (confirmationModal) {
          const refElem = confirmationModal.querySelector('.modal-booking-ref');
          const summaryName = confirmationModal.querySelector('.res-name');
          const summaryDateTime = confirmationModal.querySelector('.res-datetime');
          const summaryGuests = confirmationModal.querySelector('.res-guests');
          const summarySeating = confirmationModal.querySelector('.res-seating');
          const whatsappLink = confirmationModal.querySelector('a[href*="wa.me"]');
          if (refElem) refElem.textContent = `Reservation Reference: #${reservationData.ref}`;
          if (summaryName) summaryName.textContent = reservationData.name;
          if (summaryDateTime) summaryDateTime.textContent = `${reservationData.date} at ${reservationData.time}`;
          if (summaryGuests) summaryGuests.textContent = `${reservationData.guests} Guest(s)`;
          if (summarySeating) summarySeating.textContent = reservationData.seating;
          if (whatsappLink) {
            const message = `Hello, I submitted reservation request ${reservationData.ref} for ${reservationData.date} at ${reservationData.time}.`;
            whatsappLink.href = `https://wa.me/919847012345?text=${encodeURIComponent(message)}`;
          }
          confirmationModal.classList.add('active');
          confirmationModal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        } else {
          showToast(`Reservation saved. Reference #${reservationData.ref}`, 'success');
        }
        form.reset();
        if (dateInput) dateInput.value = todayStr;
      } catch (error) {
        showToast(error.message || 'Could not reach the reservation service. Please call the restaurant.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  });

  // Close modals
  modalCloseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirmationModal) {
        confirmationModal.classList.remove('active');
        confirmationModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  });

  if (confirmationModal) {
    confirmationModal.addEventListener('click', (e) => {
      if (e.target === confirmationModal) {
        confirmationModal.classList.remove('active');
        confirmationModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

  // =========================================================================
  // 7. Toast Notification Utility
  // =========================================================================
  function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg style="width:18px;height:18px;stroke:#c5a059;" viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg style="width:18px;height:18px;stroke:#b84428;" viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
      iconSvg = `<svg style="width:18px;height:18px;stroke:#c5a059;" viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // =========================================================================
  // 8. Newsletter Subscription Handling
  // =========================================================================
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      if (!input || !input.checkValidity()) {
        showToast('Please enter a valid email address.', 'error');
        input?.reportValidity();
        return;
      }
      const button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      try {
        const response = await fetch('/api/newsletter', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: input.value })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Subscription could not be saved.');
        showToast('You are subscribed to the Malabar Connoisseur Club.', 'success');
        form.reset();
      } catch (error) {
        showToast(error.message || 'Could not reach the subscription service. Please try again.', 'error');
      } finally {
        if (button) button.disabled = false;
      }
    });
  });

  // Attach keyframe spinner dynamically if missing
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `;
  document.head.appendChild(styleSheet);
});
