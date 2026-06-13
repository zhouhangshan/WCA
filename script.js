/* ============================================================
   张三的魔方小站 — Global Scripts
   Particle network + mobile menu + scroll reveal
   ============================================================ */

(function () {
  'use strict';

  /* ========== Canvas Particle Network ========== */
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  let mouseX = -1000;
  let mouseY = -1000;
  let mouseActive = false;

  const PARTICLE_COUNT = 70;
  const CONNECT_DISTANCE = 140;
  const MOUSE_RADIUS = 180;
  const PARTICLE_SPEED = 0.4;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * PARTICLE_SPEED,
        vy: (Math.random() - 0.5) * PARTICLE_SPEED,
        radius: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.5 + 0.3,
      });
    }
  }

  function update() {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Mouse repulsion
      if (mouseActive) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.vx += (dx / dist) * force * 0.15;
          p.vy += (dy / dist) * force * 0.15;
        }
      }

      // Speed damping
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > PARTICLE_SPEED * 1.8) {
        p.vx = (p.vx / speed) * PARTICLE_SPEED * 1.5;
        p.vy = (p.vy / speed) * PARTICLE_SPEED * 1.5;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_DISTANCE) {
          const alpha = (1 - dist / CONNECT_DISTANCE) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`;
      ctx.fill();

      // Glow halo
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha * 0.12})`;
      ctx.fill();
    }

    // Mouse glow
    if (mouseActive) {
      const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, MOUSE_RADIUS);
      grad.addColorStop(0, 'rgba(0, 229, 255, 0.1)');
      grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, MOUSE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseActive = true;
  });

  canvas.addEventListener('mouseleave', () => {
    mouseActive = false;
  });

  // Touch support
  canvas.addEventListener('touchmove', (e) => {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    mouseActive = true;
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    mouseActive = false;
  });

  /* ========== Mobile Menu Toggle ========== */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileSidebar = document.querySelector('.mobile-sidebar');

  if (menuToggle && mobileSidebar) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileSidebar.classList.toggle('open');
      menuToggle.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    mobileSidebar.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileSidebar.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        mobileSidebar.classList.contains('open') &&
        !mobileSidebar.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        mobileSidebar.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ========== Scroll Reveal ========== */
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show all immediately
    revealElements.forEach((el) => el.classList.add('visible'));
  }

  /* ========== Active Nav Link Highlight ========== */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-sidebar a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPath)) {
      link.classList.add('active');
    }
    // Special case: index/home
    if ((currentPath === 'index.html' || currentPath === '') && href && href.includes('index.html')) {
      link.classList.add('active');
    }
  });
})();
