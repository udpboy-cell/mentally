/* mentally.lol — interactions */
(function () {
  'use strict';

  // >>> LIEN DE PAIEMENT : mettre ici l'URL de la page de paiement du script à 8 €
  // (SellAuth, Sellix, Stripe Payment Link, etc.). Tant qu'elle est vide, le
  // bouton de la page d'achat affiche « Checkout opens soon ».
  const CHECKOUT_URL = '';

  // >>> STOCK : mettre `true` quand les clés sont de nouveau disponibles.
  // Tant que c'est `false`, cliquer sur « Continue to payment » affiche « Out of stock ».
  const IN_STOCK = false;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Fenêtre « Out of stock » */
  function showOutOfStock(opener) {
    let modal = $('#stockModal');
    if (!modal) {
      const logo = $('.order-product img');
      modal = document.createElement('div');
      modal.id = 'stockModal';
      modal.className = 'stock-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'stockTitle');
      modal.innerHTML =
        '<div class="stock-card">' +
          (logo ? '<img src="' + logo.getAttribute('src') + '" alt="">' : '') +
          '<h3 id="stockTitle">Out of stock</h3>' +
          '<p>Mentally for Rivals is out of stock right now. New keys are coming soon, check back shortly.</p>' +
          '<button type="button" class="btn btn-primary btn-block btn-lg stock-close">Got it<span class="cursor-glow"></span></button>' +
        '</div>';
      document.body.appendChild(modal);
      const close = () => {
        modal.classList.remove('open');
        document.removeEventListener('keydown', onKey);
        if (modal._opener) modal._opener.focus();
      };
      const onKey = (e) => { if (e.key === 'Escape') close(); };
      modal._onKey = onKey;
      modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
      $('.stock-close', modal).addEventListener('click', close);
    }
    modal._opener = opener || null;
    modal.classList.add('open');
    document.addEventListener('keydown', modal._onKey);
    setTimeout(() => $('.stock-close', modal).focus(), 30);
  }

  /* Page d'achat : case CGV obligatoire puis redirection vers le paiement */
  const checkoutBtn = $('#checkoutBtn');
  const agree = $('#agreeTerms');
  const note = $('#checkoutNote');
  if (checkoutBtn && agree) {
    const sync = () => {
      checkoutBtn.classList.toggle('is-disabled', !agree.checked);
      checkoutBtn.setAttribute('aria-disabled', String(!agree.checked));
    };
    agree.addEventListener('change', sync);
    sync();
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!IN_STOCK) {
        showOutOfStock(checkoutBtn);
        if (note) { note.textContent = 'Currently out of stock.'; note.classList.add('warn'); }
        return;
      }
      if (!agree.checked) {
        const label = agree.closest('.agree');
        if (label) { label.classList.remove('shake'); void label.offsetWidth; label.classList.add('shake'); }
        return;
      }
      if (!CHECKOUT_URL) {
        if (note) { note.textContent = 'Checkout opens soon. Please check back in a moment.'; note.classList.add('warn'); }
        return;
      }
      window.location.href = CHECKOUT_URL;
    });
  }

  /* Cartes à halo qui suit la souris (SpotlightCard) */
  $$('.spotlight-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* Vidéo de fond : coupée si l'utilisateur préfère moins d'animations */
  const bgVideo = $('.site-bg-video');
  if (bgVideo && reduceMotion) { bgVideo.pause(); bgVideo.removeAttribute('autoplay'); }

  /* Menu mobile */
  const burger = $('#burgerBtn');
  const mobileMenu = $('#mobileMenu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    $$('a', mobileMenu).forEach((a) => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
  }

  /* Barre de progression + retour en haut */
  const progress = $('#scrollProgress');
  const toTop = $('#toTop');
  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const y = window.scrollY || doc.scrollTop;
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (toTop) toTop.classList.toggle('show', y > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* Apparition au scroll */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, idx) => {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = (idx % 4) * 0.08 + 's';
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* Halo suivant le curseur */
  if (window.matchMedia('(hover:hover)').matches) {
    $$('.btn-primary').forEach((btn) => {
      btn.addEventListener('pointermove', (ev) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--gx', (ev.clientX - r.left) + 'px');
        btn.style.setProperty('--gy', (ev.clientY - r.top) + 'px');
      });
    });
  }

  /* Avis : étoiles + avatar générés, puis carrousel coverflow */
  const reviewsTrack = $('#reviewsTrack');
  if (reviewsTrack) {
    const star = '<svg viewBox="0 0 20 20"><path d="M10 1l2.7 6 6.3.6-4.8 4.2 1.5 6.2L10 14.9 4.3 18l1.5-6.2L1 7.6l6.3-.6z"/></svg>';
    const base = $$('.review-card', reviewsTrack);
    base.forEach((card) => {
      const name = card.dataset.name || 'User';
      card.insertAdjacentHTML('afterbegin', '<div class="review-stars">' + star.repeat(5) + '</div>');
      card.insertAdjacentHTML('beforeend',
        '<div class="review-who"><div class="review-avatar">' + name.slice(0, 1).toUpperCase() + '</div><span>' + name + '</span></div>');
    });
    // trois copies pour un défilement circulaire sans trou
    for (let c = 0; c < 2; c++) base.forEach((card) => reviewsTrack.appendChild(card.cloneNode(true)));

    const cards = $$('.review-card', reviewsTrack);
    const n = cards.length;
    let current = base.length; // commencer sur la copie du milieu

    const layout = () => {
      cards.forEach((card, i) => {
        let k = (i - current) % n;
        if (k > n / 2) k -= n;
        if (k < -n / 2) k += n;
        const a = Math.abs(k);
        const s = k < 0 ? -1 : 1;
        if (a > 3) {
          card.style.transform = `translate3d(${760 * s}px, -56px, -400px) rotateY(${-32 * s}deg) rotateX(24deg) scale(0.5)`;
          card.style.opacity = '0'; card.style.zIndex = '0'; card.style.pointerEvents = 'none';
          return;
        }
        card.style.transform = `translate3d(${190 * k}px, ${-14 * a}px, ${-100 * a}px) rotateY(${-32 * k}deg) rotateX(${6 * a}deg) scale(${(1 - 0.14 * a).toFixed(2)})`;
        card.style.opacity = String(+(1 - 0.32 * a).toFixed(2));
        card.style.zIndex = String(100 - a);
        card.style.pointerEvents = a === 0 ? 'auto' : 'none';
      });
    };
    const go = (dir) => { current = (current + dir + n) % n; layout(); };

    const prev = $('#revPrev'), next = $('#revNext');
    if (prev) prev.addEventListener('click', () => go(-1));
    if (next) next.addEventListener('click', () => go(1));

    const viewport = $('#reviewsViewport') || reviewsTrack;
    let startX = null;
    viewport.addEventListener('pointerdown', (e) => { startX = e.clientX; });
    window.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX; startX = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    });
    document.addEventListener('keydown', (e) => {
      if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    });
    layout();
  }

  /* FAQ */
  $$('.faq-item').forEach((item) => {
    const q = $('.faq-q', item), a = $('.faq-a', item);
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
    });
  });
})();
