/* ===================================================================
   ROHAN VERMA - PORTFOLIO CORE LOGIC (JS/MAIN.JS)
   Theme Switcher, Continuous Rainbow Trailing Cursor,
   Scroll-Reveal Intersection Observer, Clean Contact Actions (Direct Gmail),
   Certificate Modal & Filters, Interactive Pointer Click Sparkle Effects
   =================================================================== */

// THEME SWITCHER WITH DAY / NIGHT AUDIO CHIMES
function playThemeToggleSound(theme) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!window._portfolioAudioCtx) window._portfolioAudioCtx = new AudioCtx();
    const ctx = window._portfolioAudioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    if (theme === 'light') {
      // Day Mode: Bright, cheerful, sunny rising shimmer (G5 -> B5 -> D6)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, now); // G5
      osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.08); // B5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.16); // D6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } else {
      // Night Mode: Cozy, soothing, cyber nocturnal harmonic drop (E5 -> A4 -> E4)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(440.00, now + 0.11); // A4
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.22); // E4

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {}
}

function initThemeSwitcher() {
  const themeToggle = document.getElementById('themeToggleCheckbox');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('rohan_theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.checked = savedTheme === 'dark';

    themeToggle.addEventListener('change', () => {
      const newTheme = themeToggle.checked ? 'dark' : 'light';
      playThemeToggleSound(newTheme);
      // Execute in next animation frame to prevent UI repaint stutter
      requestAnimationFrame(() => {
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('rohan_theme', newTheme);
      });
    });
  }
}

// DRIBBLE-STYLE COLOR MOUSE SPOTLIGHT & DUAL CURSOR TRACKING
function initCustomCursor() {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const spotlight = document.getElementById('cursorSpotlight');
  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let spotX = mouseX;
  let spotY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderCursorAndSpotlight() {
    // Smooth lerp for ring and ambient color spotlight
    ringX += (mouseX - ringX) * 0.2;
    ringY += (mouseY - ringY) * 0.2;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

    if (spotlight) {
      spotX += (mouseX - spotX) * 0.08;
      spotY += (mouseY - spotY) * 0.08;
      spotlight.style.transform = `translate(${spotX}px, ${spotY}px) translate(-50%, -50%)`;
    }

    requestAnimationFrame(renderCursorAndSpotlight);
  }
  renderCursorAndSpotlight();

  // Interactive hover states
  const hoverables = document.querySelectorAll('a, button, input, textarea, .certificate-card, .project-card-large, .feature-box, .axolotl-chubby-mascot');
  hoverables.forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover-active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover-active'));
  });
}

// POINTER CLICK ANIMATION (COLOR SPLASH RIPPLE & BURSTING TWINKLE SPARKLES)
function initPointerClickEffects() {
  window.addEventListener('click', (e) => {
    // Skip if clicking inside arcade game canvas to avoid overlaying game
    if (e.target && e.target.id === 'arcadeCanvas') return;

    const x = e.clientX;
    const y = e.clientY;

    // 1. Expanding & bouncing ripple ring
    const ripple = document.createElement('div');
    ripple.className = 'pointer-click-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);
    setTimeout(() => {
      if (ripple && ripple.parentNode) ripple.remove();
    }, 520);

    // 2. Starburst / color sparkle dots
    const colors = ['#00d2ff', '#ff2a85', '#9d4edd', '#ffd166', '#ff85a2', '#ffffff'];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'click-sparkle-dot';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 4 + 4;

      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.backgroundColor = color;
      dot.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      document.body.appendChild(dot);

      const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.4 - 0.2);
      const dist = Math.random() * 38 + 20;
      const vx = Math.cos(angle) * dist;
      const vy = Math.sin(angle) * dist;

      requestAnimationFrame(() => {
        dot.style.transform = `translate(${vx}px, ${vy}px) scale(0)`;
        dot.style.opacity = '0';
      });

      setTimeout(() => {
        if (dot && dot.parentNode) dot.remove();
      }, 450);
    }
  });
}

// SCROLL REVEAL OBSERVER (Rock-solid smooth reveal without edge-glitching/flicker)
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal-on-scroll');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Once smoothly revealed, keep visible and stop observing to prevent hysteresis glitching
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -20px 0px'
  });

  reveals.forEach((el) => observer.observe(el));
}

// STICKY HEADER & ACTIVE NAV LINK
function initNavigation() {
  const header = document.querySelector('.site-header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    let current = '';
    sections.forEach((sec) => {
      const secTop = sec.offsetTop - 120;
      const secHeight = sec.clientHeight;
      if (window.scrollY >= secTop && window.scrollY < secTop + secHeight) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// CERTIFICATE FILTERING & INSPECT TRIGGERS
function initCertificates() {
  const certCards = document.querySelectorAll('.certificate-card');
  const filterPills = document.querySelectorAll('.cert-filter-pill');

  // Filter Pills with Category Animation
  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.getAttribute('data-filter');

      certCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// UNIVERSAL HIGH-RES IMAGE LIGHTBOX WITH FULLSCREEN & SCROLL WHEEL ZOOM
function initUniversalImageLightbox() {
  const modal = document.getElementById('imageLightboxModal');
  const backdrop = document.getElementById('lightboxBackdrop');
  const img = document.getElementById('lightboxImg');
  const imgWrapper = document.getElementById('lightboxImgWrapper');
  const viewport = document.getElementById('lightboxViewport');
  const titleEl = document.getElementById('lightboxTitle');
  const zoomLevelEl = document.getElementById('lightboxZoomLevel');
  const zoomInBtn = document.getElementById('lightboxZoomInBtn');
  const zoomOutBtn = document.getElementById('lightboxZoomOutBtn');
  const resetBtn = document.getElementById('lightboxResetBtn');
  const fullscreenBtn = document.getElementById('lightboxFullscreenBtn');
  const closeBtn = document.getElementById('lightboxCloseBtn');

  if (!modal || !img || !imgWrapper || !viewport) return;

  let scale = 1.0;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  function updateTransform() {
    imgWrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    if (zoomLevelEl) {
      zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
    }
    if (scale > 1.0) {
      viewport.style.cursor = 'grab';
    } else {
      viewport.style.cursor = 'default';
      panX = 0;
      panY = 0;
    }
  }

  function setZoom(newScale) {
    scale = Math.min(Math.max(0.6, newScale), 4.5);
    updateTransform();
  }

  function resetZoom() {
    scale = 1.0;
    panX = 0;
    panY = 0;
    updateTransform();
  }

  window.openImageLightbox = function(src, title) {
    if (!src) return;
    img.src = src;
    if (titleEl) titleEl.textContent = title || 'Image Inspection';
    resetZoom();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function closeLightbox() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setTimeout(resetZoom, 250);
  }

  // Zoom on Scroll Wheel Up / Down
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomStep = 0.18;
    if (e.deltaY < 0) {
      setZoom(scale + zoomStep);
    } else {
      setZoom(scale - zoomStep);
    }
  }, { passive: false });

  // Pan / Drag when zoomed in
  viewport.addEventListener('mousedown', (e) => {
    if (scale <= 1.0) return;
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    viewport.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging || scale <= 1.0) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    imgWrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      viewport.style.cursor = scale > 1.0 ? 'grab' : 'default';
    }
  });

  // Double click to toggle 2x zoom
  viewport.addEventListener('dblclick', (e) => {
    if (scale > 1.05) {
      resetZoom();
    } else {
      setZoom(2.0);
    }
  });

  // Toolbar Actions
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => setZoom(scale + 0.25));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => setZoom(scale - 0.25));
  if (resetBtn) resetBtn.addEventListener('click', resetZoom);
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

  // Fullscreen API toggle
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const container = document.getElementById('lightboxContainer');
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Attach Lightbox triggers to Certificate Cards & Inspect Buttons
  const certCards = document.querySelectorAll('.certificate-card');
  certCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // Don't open lightbox if user clicked the external drive link button
      if (e.target.closest('.cert-drive-link-btn')) return;
      const certImg = card.querySelector('.certificate-img');
      const title = card.getAttribute('data-title') || 'Certificate Inspection';
      if (certImg) {
        window.openImageLightbox(certImg.src, title);
      }
    });
  });

  // Attach Lightbox triggers to Project Main Previews
  const allProjectImgs = document.querySelectorAll('.media-main-preview');
  allProjectImgs.forEach((imgEl) => {
    imgEl.style.cursor = 'zoom-in';
    imgEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const alt = imgEl.getAttribute('alt') || imgEl.getAttribute('title') || 'Project Inspection';
      window.openImageLightbox(imgEl.src, alt);
    });
  });

  // Also support double-clicking thumbnail buttons to launch lightbox directly
  const thumbBtnsForLightbox = document.querySelectorAll('.media-thumb-btn');
  thumbBtnsForLightbox.forEach((btn) => {
    btn.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const src = btn.getAttribute('data-preview-src');
      const title = btn.getAttribute('title') || 'Project Inspection';
      if (src) window.openImageLightbox(src, title);
    });
  });
}

// PROJECT GALLERY THUMBNAIL SWITCHER & IOU SIMULATOR
function initProjectFeatures() {
  const thumbBtns = document.querySelectorAll('.media-thumb-btn');
  thumbBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const parentCol = btn.closest('.project-media-col');
      const mainPreview = parentCol.querySelector('.media-main-preview');
      const newSrc = btn.getAttribute('data-preview-src');

      parentCol.querySelectorAll('.media-thumb-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (mainPreview && newSrc) {
        mainPreview.style.opacity = '0.4';
        setTimeout(() => {
          mainPreview.src = newSrc;
          mainPreview.style.opacity = '1';
        }, 120);
      }
    });
  });

  // Safety-First IoU Conflict Simulator
  const iouSlider = document.getElementById('iouSlider');
  const iouVal = document.getElementById('iouVal');
  const iouDecision = document.getElementById('iouDecision');

  if (iouSlider && iouVal && iouDecision) {
    iouSlider.addEventListener('input', () => {
      const val = parseFloat(iouSlider.value);
      iouVal.textContent = val.toFixed(2);

      if (val >= 0.50) {
        iouDecision.innerHTML = '🚨 CONFLICT DETECTED &rarr; <b>FLAG AS UNSAFE (Safety-First Rule)</b>';
        iouDecision.style.color = '#ff2a85';
        iouDecision.style.background = 'rgba(255, 42, 133, 0.15)';
      } else {
        iouDecision.innerHTML = '✅ Independent Entities &rarr; <b>Standard Scoring</b>';
        iouDecision.style.color = '#00d2ff';
        iouDecision.style.background = 'rgba(0, 210, 255, 0.15)';
      }
    });
  }
}

// UNIFIED CONTACT FORM: DIRECT EMAIL SENDING (WITH CONFIRMATION & SENT TOAST)
function initContactForm() {
  const form = document.getElementById('contactForm');
  const confirmModal = document.getElementById('mailConfirmModal');
  const confirmSender = document.getElementById('mailConfirmSender');
  const confirmSubject = document.getElementById('mailConfirmSubject');
  const proceedBtn = document.getElementById('proceedMailSendBtn');
  const cancelBtn = document.getElementById('cancelMailSendBtn');
  const toast = document.getElementById('mailSentToast');
  if (!form) return;

  let pendingData = null;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const userEmailInput = document.getElementById('contactUserEmail');
    const subjectInput = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');

    const userEmail = userEmailInput ? userEmailInput.value.trim() : '';
    const subject = subjectInput ? subjectInput.value.trim() : 'Inquiry from Portfolio';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!userEmail || !message) return;

    pendingData = { userEmail, subject, message };

    if (confirmSender) confirmSender.textContent = userEmail;
    if (confirmSubject) confirmSubject.textContent = subject || '(No Subject)';
    if (confirmModal) confirmModal.classList.add('active');
  });

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (confirmModal) confirmModal.classList.remove('active');
      pendingData = null;
    });
  }

  if (confirmModal) {
    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        confirmModal.classList.remove('active');
        pendingData = null;
      }
    });
  }

  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      if (!pendingData) return;
      const { userEmail, subject, message } = pendingData;
      if (confirmModal) confirmModal.classList.remove('active');

      // Construct direct, prefilled Gmail compose URL with user's customized subject and body
      const customSubject = `[Portfolio Inquiry] ${subject}`;
      const bodyText = `Hi Rohan,\n\n${message}\n\n----------------------------------------\nSender Contact: ${userEmail}\nSent from Rohan Verma Portfolio`;

      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=rohanvermahja@gmail.com&su=${encodeURIComponent(customSubject)}&body=${encodeURIComponent(bodyText)}`;

      // Open direct web Gmail compose in new tab
      const win = window.open(gmailUrl, '_blank');

      // If popup was blocked or user prefers mailto client fallback
      if (!win || win.closed || typeof win.closed === 'undefined') {
        const mailtoUrl = `mailto:rohanvermahja@gmail.com?subject=${encodeURIComponent(customSubject)}&body=${encodeURIComponent(bodyText)}`;
        window.location.href = mailtoUrl;
      }

      showSentToast();
      form.reset();
      pendingData = null;
    });
  }

  function showSentToast() {
    if (!toast) return;
    toast.classList.add('toast-active');
    setTimeout(() => {
      toast.classList.remove('toast-active');
    }, 5000);
  }
}

// INITIALIZE ALL
document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  initCustomCursor();
  initPointerClickEffects();
  initScrollReveal();
  initNavigation();
  initCertificates();
  initUniversalImageLightbox();
  initProjectFeatures();
  initContactForm();
});
