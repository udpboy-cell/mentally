/*
 * fx.js — effets de texte et logo 3D de mentally.lol
 *
 * Effets dans l'esprit de la collection React Bits, réécrits en JavaScript
 * simple (pas de React, pas de build) :
 *   data-fx="split"          lettres qui montent une à une (SplitText)
 *   data-fx="blur"           mots qui sortent du flou (BlurText)
 *   data-fx="decrypt"        texte qui se décrypte à l'apparition (DecryptedText)
 *   data-fx="decrypt-hover"  idem, au survol
 *   data-fx="count"          compteur animé (CountUp) : data-to, data-decimals, data-duration
 *   .rotator[data-words]     mot qui change en boucle (RotatingText)
 *   .shiny                   reflet qui balaie le texte (ShinyText, en CSS)
 *   #logo3d                  logo en relief qui s'incline vers la souris (TiltedCard)
 *
 * Options communes : data-fx-start="load" (au chargement au lieu du scroll),
 * data-fx-delay="0.4" (secondes).
 */
(function () {
  'use strict';

  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&*+=<>/\\$@!?';
  const randGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

  /* ---------- Déclenchement : au chargement ou à l'entrée dans l'écran ---------- */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          play(e.target);
        });
      }, { threshold: 0.25, rootMargin: '0px 0px -6% 0px' })
    : null;

  function schedule(el) {
    if (reduce) { finish(el); return; }
    if (el.dataset.fxStart === 'load' || !io) {
      const d = parseFloat(el.dataset.fxDelay || '0') * 1000;
      setTimeout(() => play(el), 120 + d);
    } else {
      io.observe(el);
    }
  }

  function play(el) {
    const kind = el.dataset.fx;
    if (kind === 'split' || kind === 'blur') {
      const d = el.dataset.fxStart === 'load' ? 0 : parseFloat(el.dataset.fxDelay || '0') * 1000;
      setTimeout(() => el.classList.add('fx-in'), d);
      // Filet de sécurité : si le navigateur a suspendu les transitions
      // (onglet en arrière-plan, mode économie d'énergie…), on fixe l'état final.
      const pieces = el.querySelectorAll('.fx-char, .fx-bword').length;
      setTimeout(() => el.classList.add('fx-done'), d + 1200 + pieces * 45);
    } else if (kind === 'decrypt') {
      decrypt(el, 900);
    } else if (kind === 'count') {
      countUp(el);
    }
  }

  function finish(el) {
    el.classList.add('fx-in', 'fx-done');
  }

  /* ---------- SplitText : découpe en lettres, mots insécables ---------- */
  function splitChars(el) {
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const word = document.createElement('span');
            word.className = 'fx-word';
            for (const ch of part) {
              const c = document.createElement('span');
              c.className = 'fx-char';
              c.style.setProperty('--i', i++);
              c.textContent = ch;
              word.appendChild(c);
            }
            frag.appendChild(word);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          // un élément en dégradé (chrome) s'anime d'un bloc pour garder son dégradé
          if (child.matches('.chrome, .chrome-static, .rotator')) {
            child.classList.add('fx-char', 'fx-unit');
            child.style.setProperty('--i', i++);
          } else {
            walk(child);
          }
        }
      });
    };
    walk(el);
    el.setAttribute('aria-label', label);
    $$('.fx-word, .fx-unit', el).forEach((w) => w.setAttribute('aria-hidden', 'true'));
    el.classList.add('fx-split');
  }

  /* ---------- BlurText : découpe en mots ---------- */
  function splitWords(el) {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'fx-bword';
            w.style.setProperty('--i', i++);
            w.textContent = part;
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          child.classList.add('fx-bword');
          child.style.setProperty('--i', i++);
        }
      });
    };
    walk(el);
    el.classList.add('fx-blur');
  }

  /* ---------- DecryptedText ---------- */
  function textNodes(el) {
    const out = [];
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) if (n.textContent.trim()) out.push(n);
    return out;
  }

  function decrypt(el, duration) {
    if (el._decrypting) return;
    el._decrypting = true;
    const nodes = textNodes(el);
    const originals = el._orig || (el._orig = nodes.map((n) => n.textContent));
    const total = originals.reduce((s, t) => s + t.length, 0);
    const start = performance.now();
    el.classList.add('fx-decrypting');
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const revealed = Math.floor(p * total);
      let k = 0;
      nodes.forEach((n, idx) => {
        const src = originals[idx];
        let s = '';
        for (const ch of src) {
          s += (k < revealed || ch === ' ') ? ch : randGlyph();
          k++;
        }
        n.textContent = s;
      });
      if (p < 1) requestAnimationFrame(tick);
      else {
        nodes.forEach((n, idx) => { n.textContent = originals[idx]; });
        el.classList.remove('fx-decrypting');
        el._decrypting = false;
      }
    };
    requestAnimationFrame(tick);
  }

  /* ---------- CountUp ---------- */
  function countUp(el) {
    const to = parseFloat(el.dataset.to || el.textContent);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const dur = parseFloat(el.dataset.duration || '1.6') * 1000;
    const start = performance.now();
    const ease = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = (to * ease(p)).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = to.toFixed(dec);
    };
    el.textContent = (0).toFixed(dec);
    requestAnimationFrame(tick);
  }

  /* ---------- RotatingText ---------- */
  function rotator(el) {
    const words = (el.dataset.words || '').split('|').filter(Boolean);
    const first = el.querySelector('.rotator-word');
    if (words.length < 2 || !first) return;
    const cls = first.className;
    el.innerHTML = '';
    const items = words.map((w, idx) => {
      const s = document.createElement('span');
      s.className = cls + (idx === 0 ? ' is-active' : '');
      s.textContent = w;
      el.appendChild(s);
      return s;
    });
    el.setAttribute('aria-label', words[0]);
    const fit = (idx) => { el.style.width = items[idx].getBoundingClientRect().width + 'px'; };
    let cur = 0;
    const ready = () => fit(cur);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready); else ready();
    window.addEventListener('resize', ready);
    if (reduce) return;
    setInterval(() => {
      const prev = items[cur];
      cur = (cur + 1) % items.length;
      const next = items[cur];
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      next.classList.remove('is-leaving');
      next.classList.add('is-active');
      fit(cur);
      el.setAttribute('aria-label', words[cur]);
      setTimeout(() => prev.classList.remove('is-leaving'), 700);
    }, 2600);
  }

  /* ---------- Initialisation des textes ---------- */
  $$('[data-fx="split"]').forEach((el) => { splitChars(el); schedule(el); });
  $$('[data-fx="blur"]').forEach((el) => { splitWords(el); schedule(el); });
  $$('[data-fx="decrypt"], [data-fx="count"]').forEach(schedule);
  $$('[data-fx="decrypt-hover"]').forEach((el) => {
    if (reduce) return;
    el.addEventListener('mouseenter', () => decrypt(el, 520));
    const link = el.closest('a');
    if (link && link !== el) link.addEventListener('focus', () => decrypt(el, 520));
  });
  $$('.rotator').forEach(rotator);

  /* ======================================================================
     Logo 3D : épaisseur par couches, inclinaison vers la souris, reflet
     ====================================================================== */
  const root = document.getElementById('logo3d');
  if (!root) return;
  const stage = root.querySelector('.logo3d-stage');
  const face = root.querySelector('.logo3d-face');
  const depth = root.querySelector('.logo3d-depth');
  const shine = root.querySelector('.logo3d-shine');
  const area = root.closest('.hero') || root.parentElement;

  // couches d'épaisseur derrière la face
  const LAYERS = 14, STEP = 1.6;
  const depthSrc = (root.querySelector('.logo3d-shadow') || {}).src || face.src;
  for (let i = 1; i <= LAYERS; i++) {
    const img = document.createElement('img');
    img.src = depthSrc;
    img.alt = '';
    img.className = 'logo3d-layer';
    img.style.transform = `translateZ(${-i * STEP}px)`;
    img.style.filter = `brightness(${(1.25 - i * 0.05).toFixed(2)})`;
    depth.appendChild(img);
  }

  // reflet dessiné dans un canvas, découpé à la forme du logo
  const ctx = shine.getContext('2d');
  const maskImg = new Image();
  maskImg.src = depthSrc;
  let canvasReady = false;
  function sizeCanvas() {
    const r = face.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    shine.width = Math.max(1, Math.round(r.width * dpr));
    shine.height = Math.max(1, Math.round(r.height * dpr));
    canvasReady = maskImg.complete && maskImg.naturalWidth > 0;
  }
  maskImg.onload = sizeCanvas;
  face.addEventListener('load', sizeCanvas);
  window.addEventListener('resize', sizeCanvas);
  sizeCanvas();

  function drawShine(px, py, sweep) {
    if (!canvasReady) return;
    const w = shine.width, h = shine.height;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(maskImg, 0, 0, w, h);
    ctx.globalCompositeOperation = 'source-in';
    // lumière qui suit la souris
    const g = ctx.createRadialGradient(px * w, py * h, 0, px * w, py * h, w * 0.45);
    g.addColorStop(0, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.35, 'rgba(214,196,255,0.18)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // bande de reflet qui balaie le logo
    if (sweep >= 0 && sweep <= 1) {
      ctx.globalCompositeOperation = 'source-atop';
      const x = (sweep * 1.6 - 0.3) * w;
      const lg = ctx.createLinearGradient(x - w * 0.12, 0, x + w * 0.12, h * 0.35);
      lg.addColorStop(0, 'rgba(255,255,255,0)');
      lg.addColorStop(0.5, 'rgba(255,255,255,0.45)');
      lg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, w, h);
    }
  }

  let tx = 0, ty = 0, cx = 0, cy = 0;     // rotation cible / courante
  let lx = 0.35, ly = 0.25, clx = 0.35, cly = 0.25; // lumière cible / courante
  let hovering = false;
  const MAX_X = 16, MAX_Y = 22;

  area.addEventListener('pointermove', (e) => {
    const r = root.getBoundingClientRect();
    const px = Math.min(1.2, Math.max(-0.2, (e.clientX - r.left) / r.width));
    const py = Math.min(1.2, Math.max(-0.2, (e.clientY - r.top) / r.height));
    hovering = true;
    ty = (px - 0.5) * 2 * MAX_Y;
    tx = -(py - 0.5) * 2 * MAX_X;
    lx = px; ly = py;
  });
  area.addEventListener('pointerleave', () => { hovering = false; });

  let visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(root);
  }

  const t0 = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || root.classList.contains('gl-ready')) return;
    const t = (now - t0) / 1000;
    if (!hovering && !reduce) {
      // balancement lent quand la souris n'est pas là
      tx = Math.sin(t * 0.7) * 7;
      ty = Math.sin(t * 0.45) * 14;
      lx = 0.5 + Math.sin(t * 0.45) * 0.35;
      ly = 0.3 + Math.cos(t * 0.7) * 0.15;
    }
    const k = reduce ? 1 : 0.08;
    cx += (tx - cx) * k; cy += (ty - cy) * k;
    clx += (lx - clx) * k; cly += (ly - cly) * k;
    stage.style.transform = `rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg)`;
    const period = 5.5;
    const sweep = reduce ? -1 : ((t % period) / 1.4);
    drawShine(clx, cly, sweep);
  }
  requestAnimationFrame(frame);
})();
