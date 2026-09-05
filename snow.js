/* ============================================================
   Lurne — падающие снежинки (Canvas 2D)
   Фоновый слой: символы ✻ + ❄ ❅   (60–90 шт.)
   Передний слой: детализированные SVG-снежинки (10–20 шт.)
   Ветер — sin-волна по X. respects prefers-reduced-motion.
   ============================================================ */

(() => {
  'use strict';

  const canvas = document.getElementById('snow-canvas');
  if (!canvas) return;

  // Уважаем reduced-motion
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // На мобильных — меньше плотность
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  // Снежинки фонового слоя — простые символы
  const SYMBOLS = ['✻', '+', '❄', '❅'];
  const SYMBOL_COUNT = isMobile ? 36 : 80;

  // Передний слой — рисуем сами как пути (быстрее, чем PNG)
  const FOREGROUND_COUNT = isMobile ? 8 : 14;

  let W = 0, H = 0;
  let flakesBack = [];
  let flakesFront = [];

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  // Генерирует SVG-снежинку как путь (детализированную)
  function drawSnowflakePath(c, x, y, size, alpha) {
    c.save();
    c.translate(x, y);
    c.strokeStyle = `rgba(27, 42, 74, ${alpha})`;
    c.lineWidth = 0.9;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    const arms = 6;
    for (let i = 0; i < arms; i++) {
      c.save();
      c.rotate((Math.PI * 2 * i) / arms);
      // основная ветвь
      c.moveTo(0, 0);
      c.lineTo(0, -size);
      // мелкие ветви
      const branches = [
        { at: 0.4, dir: 1, len: size * 0.28 },
        { at: 0.7, dir: -1, len: size * 0.22 }
      ];
      branches.forEach(b => {
        const yy = -size * b.at;
        c.moveTo(0, yy);
        c.lineTo(b.len * b.dir, yy - b.len);
      });
      c.restore();
    }
    c.stroke();
    // Центральная точка
    c.fillStyle = `rgba(27, 42, 74, ${alpha})`;
    c.beginPath();
    c.arc(0, 0, 1, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  function init() {
    flakesBack = [];
    for (let i = 0; i < SYMBOL_COUNT; i++) {
      flakesBack.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: rand(8, 18),      // px размер шрифта
        speed: rand(0.3, 0.9),  // px/frame
        drift: rand(0.4, 1.2),  // амплитуда ветра
        phase: Math.random() * Math.PI * 2,
        alpha: rand(0.18, 0.45),
        char: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        spin: rand(-0.01, 0.01)
      });
    }

    flakesFront = [];
    for (let i = 0; i < FOREGROUND_COUNT; i++) {
      flakesFront.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: rand(14, 22),
        speed: rand(0.4, 1.1),
        drift: rand(0.6, 1.8),
        phase: Math.random() * Math.PI * 2,
        alpha: rand(0.55, 0.95),
        rot: Math.random() * Math.PI * 2,
        spin: rand(-0.006, 0.006)
      });
    }
  }

  let t = 0;
  function frame() {
    t += 1;
    ctx.clearRect(0, 0, W, H);

    // Фоновый слой
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const f of flakesBack) {
      f.y += f.speed;
      f.x += Math.sin((t + f.phase) * 0.012) * f.drift * 0.4;
      f.rot = (f.rot || 0) + f.spin;
      if (f.y > H + 20) { f.y = -20; f.x = Math.random() * W; }
      if (f.x < -20) f.x = W + 20;
      if (f.x > W + 20) f.x = -20;

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.fillStyle = `rgba(27, 42, 74, ${f.alpha})`;
      ctx.font = `${f.size}px Inter, system-ui, sans-serif`;
      ctx.fillText(f.char, 0, 0);
      ctx.restore();
    }

    // Передний слой — детализированные
    for (const f of flakesFront) {
      f.y += f.speed;
      f.x += Math.sin((t + f.phase) * 0.014) * f.drift * 0.5;
      f.rot += f.spin;
      if (f.y > H + 30) { f.y = -30; f.x = Math.random() * W; }
      if (f.x < -30) f.x = W + 30;
      if (f.x > W + 30) f.x = -30;

      drawSnowflakePath(ctx, f.x, f.y, f.size, f.alpha);
    }

    requestAnimationFrame(frame);
  }

  // Скрываем, когда вкладка не активна — экономия CPU
  let visible = !document.hidden;
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
  });

  function loop() {
    if (visible) frame();
    else requestAnimationFrame(loop);
  }

  // Debounce resize
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      init();
    }, 120);
  });

  resize();
  init();
  loop();
})();
