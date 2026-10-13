(function () {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const backTop = document.getElementById('backTop');

  // Navbar com fundo ao rolar + botão "voltar ao topo"
  function onScroll() {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);
    backTop.classList.toggle('show', y > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Menu mobile
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navMenu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Toggle de preços (mensal / anual)
  const toggle = document.getElementById('periodToggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-period]');
      if (!btn) return;
      const period = btn.dataset.period;
      toggle.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
      document.querySelectorAll('[data-mensal][data-anual]').forEach((el) => {
        el.textContent = el.dataset[period];
      });
    });
  }

  // FAQ: abre um por vez
  const acc = document.getElementById('faqAcc');
  if (acc) {
    acc.querySelectorAll('details').forEach((d) => {
      d.addEventListener('toggle', () => {
        if (!d.open) return;
        acc.querySelectorAll('details[open]').forEach((o) => { if (o !== d) o.open = false; });
      });
    });
  }

  // Slogan com efeito de digitação
  document.querySelectorAll('.typewriter').forEach((el) => {
    const out = el.querySelector('.typewriter-text');
    let phrases = [];
    try { phrases = JSON.parse(el.dataset.phrases || '[]'); } catch (e) { return; }
    if (!out || phrases.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const TYPE = 55, ERASE = 30, HOLD = 2600, GAP = 400;
    // a primeira frase já está escrita no HTML: começa apagando
    let i = 0, len = phrases[0].length, deleting = true;

    function tick() {
      const phrase = phrases[i];
      len += deleting ? -1 : 1;
      out.textContent = phrase.slice(0, len);
      let delay = deleting ? ERASE : TYPE;
      if (!deleting && len === phrase.length) { deleting = true; delay = HOLD; }
      else if (deleting && len === 0) { deleting = false; i = (i + 1) % phrases.length; delay = GAP; }
      setTimeout(tick, delay);
    }
    setTimeout(tick, HOLD);
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
