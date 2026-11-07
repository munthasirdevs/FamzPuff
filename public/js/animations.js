// ============================================================================
// VELORA // PROJECT: CAESAR - CREATIVE MOTION ARCHITECTURE
// GSAP 3 Preloader, ScrollTriggers & 2D Editorial Micro-Interactions
// ============================================================================

if (typeof gsap !== 'undefined') {
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
  if (typeof Flip !== 'undefined') gsap.registerPlugin(Flip);
}

// 1. Creative Loading Screen: "The Arterial Silk & Monolith Dock"
function initCaesarPreloader() {
  const preloader = document.getElementById('caesar-preloader');
  if (!preloader || typeof gsap === 'undefined') return;

  const counterEl = document.getElementById('preloader-counter-num');
  const filament = document.querySelector('.preloader-filament');
  const chars = document.querySelectorAll('#preloader-logo-wrap .char');
  const subLabel = document.querySelector('#preloader-logo-wrap .sub-label');
  const shutterTop = document.querySelector('.preloader-shutter-top');
  const shutterBottom = document.querySelector('.preloader-shutter-bottom');
  const burgundyVeil = document.querySelector('.preloader-burgundy-veil');
  const preloaderLogo = document.getElementById('preloader-logo-text');
  const navLogoTarget = document.querySelector('.header-logo-target');

  const hasLoadedBefore = sessionStorage.getItem('velora_loaded') === 'true';

  if (hasLoadedBefore) {
    // Quick fadeout for subsequent page transitions
    preloader.style.display = 'none';
    document.body.classList.remove('overflow-hidden');
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    return;
  }

  sessionStorage.setItem('velora_loaded', 'true');
  document.body.classList.add('overflow-hidden');

  const progress = { value: 0 };
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      preloader.style.display = 'none';
      document.body.classList.remove('overflow-hidden');
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }
  });

  // Phase 1 & 2: Ignition & Counter 000 -> 100
  tl.to(progress, {
    value: 100,
    duration: 1.3,
    ease: 'power2.inOut',
    onUpdate: () => {
      if (counterEl) counterEl.textContent = String(Math.floor(progress.value)).padStart(3, '0');
    }
  }, 0)
  .to(filament, {
    scaleX: 1,
    duration: 1.2,
    ease: 'expo.inOut'
  }, 0.1)

  // Phase 3: Monolith Character Mask Rise
  .to(chars, {
    yPercent: 0,
    stagger: 0.04,
    duration: 0.7,
    ease: 'power4.out'
  }, 0.45)
  .to(subLabel, {
    opacity: 1,
    letterSpacing: '0.4em',
    duration: 0.5
  }, 0.8)

  // Phase 4: Filament Collapse & Header Dock Transfer
  .to(filament, {
    backgroundColor: '#FFFFFF',
    height: '2px',
    duration: 0.15
  }, 1.35)
  .to(filament, {
    scaleY: 0,
    opacity: 0,
    duration: 0.2
  }, 1.5)
  .add(() => {
    if (preloaderLogo && navLogoTarget && typeof Flip !== 'undefined') {
      try {
        const state = Flip.getState(preloaderLogo);
        navLogoTarget.innerHTML = '';
        navLogoTarget.appendChild(preloaderLogo);
        Flip.from(state, {
          duration: 0.75,
          ease: 'expo.inOut',
          scale: true
        });
      } catch (e) {
        console.warn('Flip skipped:', e);
      }
    }
  }, 1.5)

  // Phase 5: Dual Shutters & Burgundy Silk Veil Parting
  .to([subLabel, '#preloader-counter', '.preloader-telemetry'], {
    opacity: 0,
    y: -15,
    duration: 0.35
  }, 1.45)
  .to(shutterTop, {
    yPercent: -100,
    duration: 0.85,
    ease: 'expo.inOut'
  }, 1.55)
  .to(shutterBottom, {
    yPercent: 100,
    duration: 0.85,
    ease: 'expo.inOut'
  }, 1.55)
  .to(burgundyVeil, {
    clipPath: 'inset(50% 0 50% 0)',
    duration: 0.85,
    ease: 'expo.inOut'
  }, 1.65)
  .from('.hero-reveal-item', {
    y: 35,
    opacity: 0,
    stagger: 0.09,
    duration: 0.75,
    ease: 'power3.out'
  }, 1.85);
}

// 2. ScrollTrigger Section Animations
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Header compact on scroll
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        header.classList.remove('h-20');
        header.classList.add('h-16', 'bg-caesar-black/95', 'shadow-lg');
      } else {
        header.classList.add('h-20');
        header.classList.remove('h-16', 'shadow-lg');
      }
    });
  }

  // Hero Parallax
  const heroShowcase = document.querySelector('.hero-showcase');
  if (heroShowcase) {
    gsap.to(heroShowcase, {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2
      }
    });
  }

  // Category Cards Stagger Reveal
  const catCards = document.querySelectorAll('.category-card');
  if (catCards.length > 0) {
    gsap.from(catCards, {
      y: 35,
      opacity: 0,
      stagger: 0.08,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#featured-collections',
        start: 'top 82%'
      }
    });
  }

  // Top Picks Product Cards Stagger Reveal
  const productCards = document.querySelectorAll('.product-grid-card');
  if (productCards.length > 0) {
    gsap.from(productCards, {
      y: 40,
      opacity: 0,
      stagger: 0.06,
      duration: 0.65,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#top-picks-section',
        start: 'top 80%'
      }
    });
  }

  // Spotlight Banner Shoe Parallax & Halo Rotation
  const spotlightShoe = document.querySelector('#spotlight-shoe');
  if (spotlightShoe) {
    gsap.to(spotlightShoe, {
      y: -24,
      rotation: -14,
      scrollTrigger: {
        trigger: '#spotlight-banner',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  }

  // Mobile Sticky Bottom Buy Bar (PDP)
  const pdpAddBtn = document.getElementById('pdp-add-to-cart');
  const mobileBar = document.getElementById('pdp-mobile-bar');
  if (pdpAddBtn && mobileBar) {
    ScrollTrigger.create({
      trigger: pdpAddBtn,
      start: 'top top',
      onEnter: () => mobileBar.classList.remove('translate-y-full'),
      onLeaveBack: () => mobileBar.classList.add('translate-y-full')
    });
  }
}

// 3. 2D Micro-Interaction Listeners (Strict Non-3D Mandate)
function initMicroInteractions() {
  // Hotspots in Spotlight section
  const hotspots = document.querySelectorAll('.spotlight-hotspot');
  hotspots.forEach(spot => {
    spot.addEventListener('mouseenter', () => {
      const targetId = spot.getAttribute('data-target');
      const card = document.getElementById(targetId);
      if (card) card.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-2');
    });
    spot.addEventListener('mouseleave', () => {
      const targetId = spot.getAttribute('data-target');
      const card = document.getElementById(targetId);
      if (card) card.classList.add('opacity-0', 'pointer-events-none', 'translate-y-2');
    });
  });

  // Testimonial Pagination cycle
  const testimonialDots = document.querySelectorAll('.testimonial-dot');
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  if (testimonialDots.length > 0 && testimonialCards.length > 0) {
    testimonialDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        testimonialDots.forEach(d => {
          d.classList.remove('w-6', 'bg-caesar-burgundy');
          d.classList.add('w-2', 'bg-caesar-border');
        });
        dot.classList.remove('w-2', 'bg-caesar-border');
        dot.classList.add('w-6', 'bg-caesar-burgundy');

        testimonialCards.forEach((c, cIdx) => {
          if (cIdx === idx) {
            c.classList.remove('opacity-40', 'scale-95');
            c.classList.add('opacity-100', 'scale-100', 'border-caesar-burgundy');
          } else {
            c.classList.add('opacity-40', 'scale-95');
            c.classList.remove('opacity-100', 'scale-100', 'border-caesar-burgundy');
          }
        });
      });
    });
  }
}

window.initCaesarPreloader = initCaesarPreloader;
window.initScrollAnimations = initScrollAnimations;
window.initMicroInteractions = initMicroInteractions;

