/* ============================================================
   Lurne — основная клиентская логика
   - Reveal-анимация секций при скролле (IntersectionObserver)
   - Тень/фон шапки при скролле
   - Случайное распределение сугробов по иконкам (на случай, если в HTML не проставлены)
   - Модалка предзаказа: открытие/закрытие, фокус-ловушка, Esc
   ============================================================ */

(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Шапка: состояние при скролле ---------- */
    const header = document.querySelector('.site-header');
    if (header) {
      const onScroll = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* ---------- Случайные сугробы на иконках ---------- */
    // 7 геометрий, чтобы распределение было разнообразным
    const driftTypes = ['classic', 'wavy', 'twin', 'flat', 'asym', 'icicle', 'hill'];
    document.querySelectorAll('[data-snowdrift]').forEach(el => {
      if (!el.dataset.snowdrift || el.dataset.snowdrift === 'random') {
        const i = Math.floor(Math.random() * driftTypes.length);
        el.dataset.snowdrift = driftTypes[i];
      }
    });

    /* ---------- Reveal ---------- */
    const reveals = document.querySelectorAll('[data-reveal]');
    if (reveals.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(el => io.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('is-visible'));
    }

    /* ---------- Модалка ---------- */
    const modal = document.getElementById('order-modal');
    if (modal) {
      const openers = document.querySelectorAll('[data-open-modal]');
      const closers = modal.querySelectorAll('[data-close-modal]');
      let lastFocused = null;

      const open = () => {
        lastFocused = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        const first = modal.querySelector('input, select, button');
        if (first) setTimeout(() => first.focus(), 50);
      };

      const close = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
      };

      openers.forEach(btn => btn.addEventListener('click', open));
      closers.forEach(btn => btn.addEventListener('click', close));

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
        // Простая фокус-ловушка
        if (e.key === 'Tab' && modal.classList.contains('is-open')) {
          const focusables = modal.querySelectorAll('input, select, button, textarea, a[href]');
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
    }
  });
})();
