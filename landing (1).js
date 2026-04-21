/* ============================================
   LANDING PAGE JS — Scroll animation & effects
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar scroll effect ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ---- Particle generation ----
  const particlesContainer = document.getElementById('hero-particles');
  if (particlesContainer) {
    for (let i = 0; i < 40; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (4 + Math.random() * 8) + 's';
      particle.style.animationDelay = Math.random() * 5 + 's';
      particle.style.width = (2 + Math.random() * 3) + 'px';
      particle.style.height = particle.style.width;
      particlesContainer.appendChild(particle);
    }
  }

  // ---- Scroll-driven bus animation ----
  const busEl = document.getElementById('bus-anim');
  const roadContainer = document.getElementById('road-container');

  if (busEl && roadContainer) {
    const updateBus = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.min(scrollTop / docHeight, 1);

      // Move bus from left (-200px) to right (window width)
      const totalTravel = window.innerWidth + 200;
      const busX = -200 + (scrollPercent * totalTravel);
      busEl.style.transform = `translateX(${busX}px)`;

      // Slight bounce effect
      const bounce = Math.sin(scrollPercent * Math.PI * 8) * 2;
      busEl.style.transform = `translateX(${busX}px) translateY(${bounce}px)`;

      // Road animation speed — faster when scrolling
      const roadLines = roadContainer.querySelectorAll('.road-line');
      roadLines.forEach(line => {
        line.style.animationDuration = scrollPercent > 0.01 ? '0.3s' : '2s';
      });
    };

    window.addEventListener('scroll', updateBus);
    updateBus();
  }

  // ---- Scroll reveal ----
  const revealElements = document.querySelectorAll('[data-scroll-reveal]');

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s var(--ease-out)';
    revealObserver.observe(el);
  });

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
