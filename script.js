/* ============================================================
   DR. LEANDRO VLADIMIR — SITE SCRIPT
   Interactivity, scroll reveals, analytics tracking
   ============================================================ */

(function () {
  'use strict';

  // ===== Year in footer =====
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Header scroll state =====
  const header = document.getElementById('header');
  let lastScroll = 0;
  const handleScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 20);
    lastScroll = y;
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ===== Mobile nav toggle =====
  const toggle = document.getElementById('navToggle');
  const nav = document.querySelector('.header__nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== Reveal on scroll =====
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
            setTimeout(() => el.classList.add('is-visible'), delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -80px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  // ===== Smooth scroll for anchor links (header offset) =====
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ===== Analytics: track WhatsApp / CTA clicks =====
  // Works with Google Tag Manager (dataLayer) and Google Analytics 4 (gtag)
  document.querySelectorAll('[data-track]').forEach((el) => {
    el.addEventListener('click', () => {
      const event = el.getAttribute('data-track');
      const url = el.getAttribute('href') || '';
      const payload = {
        event: 'cta_click',
        cta_id: event,
        cta_url: url,
        cta_text: (el.textContent || '').trim().slice(0, 80),
      };
      // Google Tag Manager
      if (window.dataLayer) window.dataLayer.push(payload);
      // GA4 direct
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'cta_click', {
          cta_id: event,
          cta_url: url,
        });
      }
      // Meta Pixel
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Contact', { source: event });
      }
    });
  });

  // ===== Scroll depth tracking (25/50/75/100%) =====
  const milestones = [25, 50, 75, 100];
  const fired = new Set();
  const onScroll = () => {
    const h = document.documentElement;
    const scrolled = ((h.scrollTop + window.innerHeight) / h.scrollHeight) * 100;
    milestones.forEach((m) => {
      if (scrolled >= m && !fired.has(m)) {
        fired.add(m);
        if (window.dataLayer) window.dataLayer.push({ event: 'scroll_depth', percent: m });
        if (typeof window.gtag === 'function') window.gtag('event', 'scroll_depth', { percent: m });
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();
