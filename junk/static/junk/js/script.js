// Global variables
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial');
let testimonialInterval;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize all website functionality
function initializeWebsite() {
    setupNavigation();
    setupScrollEffects();
    setupTestimonialCarousel();
    setupFormHandling();
    setupAnimations();
    setupMobileMenu();
}

// Navigation Setup
function setupNavigation() {
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Header scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                scrollToSection(targetId);
            }
        });
    });
}

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const sectionTop = section.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

// Mobile Menu Setup
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Scroll Effects Setup
function setupScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements with animation attributes
    document.querySelectorAll('[data-aos]').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Testimonial Carousel Setup
function setupTestimonialCarousel() {
    if (testimonials.length === 0) return;
    
    showTestimonial(0);
    startTestimonialAutoplay();
}

function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
        testimonial.classList.toggle('active', i === index);
    });
    currentTestimonial = index;
}

function changeTestimonial(direction) {
    stopTestimonialAutoplay();
    
    if (direction === 1) {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    } else {
        currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    }
    
    showTestimonial(currentTestimonial);
    startTestimonialAutoplay();
}

function startTestimonialAutoplay() {
    testimonialInterval = setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 5000);
}

function stopTestimonialAutoplay() {
    if (testimonialInterval) {
        clearInterval(testimonialInterval);
    }
}

// Form Handling Setup
function setupFormHandling() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactForm);
  }

  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fd = new FormData(quoteForm);
      // safety: ensure backend knows which form posted
      if (!fd.get('_form')) fd.append('_form', 'quote');

      const submitBtn = quoteForm.querySelector('.submit-btn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Processing...';
      submitBtn.disabled = true;

      try {
        const resp = await fetch(quoteForm.action, {
          method: 'POST',
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          body: fd
        });

        if (resp.ok) {
          closeQuoteModal();
          showNotification("Thanks! We’ll contact you shortly.", "success");
          quoteForm.reset();
        } else {
          let data = {};
          try { data = await resp.json(); } catch (_) {}
          console.error('Errors:', data.errors || data);
          showNotification('Please check your inputs and try again.', 'error');
        }
      } catch (err) {
        console.error(err);
        showNotification('Network error. Please try again.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}


function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        showNotification('Thank you! We\'ll get back to you within 24 hours.', 'success');
        e.target.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}



// Modal Functions
function openQuoteModal() {
    const modal = document.getElementById('quote-modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 100);
}

function closeQuoteModal() {
    const modal = document.getElementById('quote-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('quote-modal');
    if (e.target === modal) {
        closeQuoteModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeQuoteModal();
    }
});

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 3000;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        margin-left: auto;
    `;
    
    // Add to DOM and animate in
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || colors.info;
}

// Animation Setup
function setupAnimations() {
    // Counter animation for stats
    const stats = document.querySelectorAll('.stat h3');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    });
    
    stats.forEach(stat => statsObserver.observe(stat));
}

function animateCounter(element) {
  const raw = (element.textContent || "").trim();

  // Capture a leading integer and keep the rest (suffix) exactly as written.
  // Works for "30+", "95%", "24/7", "1,200 bookings", etc.
  const m = raw.match(/^(\d[\d,]*)(.*)$/);
  if (!m) {
    // Nothing to animate (no leading number) — leave as is.
    return;
  }

  const leadingNumStr = m[1].replace(/,/g, "");
  const suffix = m[2] || "";

  const numericValue = parseInt(leadingNumStr, 10);
  if (isNaN(numericValue)) return;

  let current = 0;
  const steps = 50;
  const increment = Math.max(1, Math.ceil(numericValue / steps));
  const intervalMs = 40;

  const tick = () => {
    current += increment;
    if (current >= numericValue) {
      current = numericValue;
      clearInterval(timer);
    }
    const displayValue = current.toLocaleString();
    element.textContent = displayValue + suffix; // preserve exact suffix (e.g., "/7", "%", "+")
  };

  const timer = setInterval(tick, intervalMs);
  tick();
}


// Service Card Interactions
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Lazy Loading for Images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[src*="placeholder"]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                
                const newImg = new Image();
                newImg.onload = () => {
                    img.src = newImg.src;
                    img.style.opacity = '1';
                };
                newImg.src = img.src;
                
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Call lazy loading setup
setupLazyLoading();

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance optimized scroll handler
const optimizedScrollHandler = throttle(() => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}, 16);

window.addEventListener('scroll', optimizedScrollHandler);

// Error Handling
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    // You could send this to an error tracking service
});

// Accessibility Improvements
document.addEventListener('keydown', (e) => {
    // Skip to main content with Tab key
    if (e.key === 'Tab' && !e.shiftKey && document.activeElement === document.body) {
        const mainContent = document.querySelector('main') || document.querySelector('.hero');
        if (mainContent) {
            mainContent.focus();
            e.preventDefault();
        }
    }
});

// Add focus indicators for keyboard navigation
document.addEventListener('DOMContentLoaded', () => {
    const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '2px solid var(--secondary-color)';
            element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = '';
            element.style.outlineOffset = '';
        });
    });
});

// Print styles handler
window.addEventListener('beforeprint', () => {
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
});

// --- Hero background carousel (desktop+mobile images) ---
(function () {
  const slidesWrap = document.getElementById('hero-slides');
  if (!slidesWrap) return;
  const slides = Array.from(slidesWrap.querySelectorAll('.hero-slide'));
  if (!slides.length) return;

  const dotsWrap = document.getElementById('hero-dots');
  const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.hero-dot')) : [];

  const hero = document.getElementById('home');
  const prevBtn = document.getElementById('hero-prev');
  const nextBtn = document.getElementById('hero-next');

  // Match small screens (same breakpoint as CSS)
  const mq = window.matchMedia('(max-width: 640px)');

  function applyBackgrounds() {
    const useMobile = mq.matches;
    slides.forEach(slide => {
      const desk = slide.getAttribute('data-desktop');
      const mob = slide.getAttribute('data-mobile');
      const url = (useMobile && mob) ? mob : desk;
      if (url) {
        slide.style.backgroundImage = `url('${url}')`;
      }
    });
  }

  // Run once on load and again when breakpoint changes
  applyBackgrounds();
  if (mq.addEventListener) {
    mq.addEventListener('change', applyBackgrounds);
  } else {
    // Safari <14 fallback
    mq.addListener(applyBackgrounds);
  }

  let idx = slides.findIndex(s => s.classList.contains('is-active'));
  if (idx < 0) idx = 0;
  let timer = null;
  const intervalMs = 3000;   // auto-swipe every 3s
  let isPaused = false;

  function go(to) {
    if (to === idx) return;
    slides[idx].classList.remove('is-active');
    if (dots[idx]) dots[idx].classList.remove('is-active');

    idx = (to + slides.length) % slides.length;

    slides[idx].classList.add('is-active');
    if (dots[idx]) dots[idx].classList.add('is-active');
  }

  function next() { go(idx + 1); }
  function prev() { go(idx - 1); }

  function start() {
    stop();
    timer = setInterval(() => { if (!isPaused) next(); }, intervalMs);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // Pause on hover (desktop)
  if (hero) {
    hero.addEventListener('mouseenter', () => { isPaused = true; });
    hero.addEventListener('mouseleave', () => { isPaused = false; });
  }

  // Dots click
  dots.forEach((d) => {
    d.addEventListener('click', () => {
      const i = Number(d.getAttribute('data-index') || '0');
      go(i);
    });
  });

  // Arrow clicks
  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  // Touch swipe (mobile)
  let touchStartX = 0;
  let touchEndX = 0;
  if (hero) {
    hero.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    hero.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const dx = touchEndX - touchStartX;
      if (Math.abs(dx) > 30) {
        if (dx < 0) next();
        else prev();
      }
    }, { passive: true });
  }

  start();
})();

function setHeaderHeightVar() {
  const header = document.querySelector('.header');
  if (!header) return;
  const h = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--header-height', `${h}px`);
}
window.addEventListener('load', setHeaderHeightVar);
window.addEventListener('resize', () => setHeaderHeightVar());
