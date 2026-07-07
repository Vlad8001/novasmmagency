/* =========================================================
   Nova SMM — script.js
   Vanilla JS, no dependencies
   ========================================================= */

(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year in footer ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const menuToggle = $('#menuToggle');
  const nav = $('#nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
    // close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
    // close on Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  const header = $('#header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Number counter ---------- */
  function animateNumber(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = '1';

    const target  = parseFloat(el.dataset.count) || 0;
    const decimal = parseInt(el.dataset.decimal || '0', 10);
    const prefix  = el.dataset.prefix || '';
    const suffix  = el.dataset.suffix || '';
    const duration = prefersReduced ? 0 : 1400;

    if (duration === 0) {
      el.textContent = prefix + target.toFixed(decimal) + suffix;
      return;
    }

    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const value = target * eased;
      el.textContent = prefix + value.toFixed(decimal) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else      el.textContent = prefix + target.toFixed(decimal) + suffix;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- IntersectionObserver — reveal / stagger / triggers ---------- */
  const revealTargets = $$('.reveal, .stagger');
  const numTargets    = $$('[data-count]');
  const donutTargets  = $$('.donut');
  const barCardTargets = $$('.result-card');
  const connectorTargets = $$('.process-connector');

  if ('IntersectionObserver' in window) {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -50px 0px' });
    revealTargets.forEach(el => revealIO.observe(el));

    const numIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateNumber(entry.target);
          numIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    numTargets.forEach(el => numIO.observe(el));

    const donutIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          donutIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    donutTargets.forEach(el => donutIO.observe(el));

    const barIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          barIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    barCardTargets.forEach(el => barIO.observe(el));

    const connIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          connIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    connectorTargets.forEach(el => connIO.observe(el));

  } else {
    // Fallback: reveal everything immediately
    revealTargets.forEach(el => el.classList.add('visible'));
    donutTargets.forEach(el => el.classList.add('animated'));
    barCardTargets.forEach(el => el.classList.add('animated'));
    connectorTargets.forEach(el => el.classList.add('animated'));
    numTargets.forEach(el => animateNumber(el));
  }

  /* ---------- Phone input formatting (light) ---------- */
  const phoneInput = $('#phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/[^\d+]/g, '');
      if (v && !v.startsWith('+')) v = '+' + v;
      e.target.value = v;
    });
  }

  /* ---------- Contact form ---------- */
  const form = $('#contactForm');
  const status = $('#formStatus');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.textContent = '';
      status.className = 'form-status';

      const data = new FormData(form);
      const name  = (data.get('name')  || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();

      if (!name) {
        status.textContent = 'Введіть ваше ім\'я.';
        status.classList.add('err');
        form.querySelector('#name').focus();
        return;
      }
      if (!phone || (phone.match(/\d/g) || []).length < 9) {
        status.textContent = 'Введіть коректний номер телефону.';
        status.classList.add('err');
        form.querySelector('#phone').focus();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const btnText = submitBtn.querySelector('span');
      const originalText = btnText ? btnText.textContent : submitBtn.textContent;

      submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Надсилаємо…';
      else submitBtn.textContent = 'Надсилаємо…';

      /* ---------- Replace this block with your integration ----------
         Options:
           • Telegram Bot: fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, ...)
           • Formspree:    fetch('https://formspree.io/f/XXXX', { method:'POST', body: data })
           • Getform:      fetch('https://getform.io/f/XXXX', { method:'POST', body: data })
           • Your API:     fetch('/api/lead', { method:'POST', body: JSON.stringify(payload) })
         ---------------------------------------------------------------- */
      const payload = Object.fromEntries(data.entries());
      console.log('Nova lead:', payload);

      setTimeout(() => {
        status.textContent = 'Дякуємо! Ми зв\'яжемось найближчим часом.';
        status.classList.add('ok');
        form.reset();
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = originalText;
        else submitBtn.textContent = originalText;

        setTimeout(() => {
          status.textContent = '';
          status.className = 'form-status';
        }, 6000);
      }, 700);
    });
  }

  /* ---------- Smooth-scroll offset for sticky header ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id && id.length > 1 && id !== '#top') {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const y = target.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
        }
      }
    });
  });

})();
