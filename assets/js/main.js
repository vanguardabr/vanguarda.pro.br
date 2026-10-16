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

  // Servidores com dados reais (status ao vivo + top 3 por kills da temporada atual),
  // pela API do VIP, que lê o warcon. O card casa pelo slug do servidor no VIP.
  const SITE_API = 'https://vip.vanguarda.pro.br/api/v1/site/servers';
  const liveCards = document.querySelectorAll('.server[data-vip-server]');
  const fmt = new Intl.NumberFormat('pt-BR');

  function renderCard(card, srv) {
    const $ = (k) => card.querySelector('[data-live="' + k + '"]');
    const s = srv.status;
    // online=null: o painel não soube dizer; não afirma que caiu
    if (s && s.online !== null) {
      const dot = $('dot');
      dot.classList.remove('pending', 'online', 'offline');
      dot.classList.add(s.online ? 'online' : 'offline');
      dot.title = s.online ? 'Online' : 'Fora do ar';
      $('online').textContent = s.online ? (s.players ?? 0) + '/' + (s.max_players ?? '?') : 'Offline';
      if (s.map) $('map').textContent = s.map.replace(/_/g, ' ');
      if (s.max_players) $('slots').textContent = s.max_players + ' slots';
    }
    if (srv.top_players.length) {
      $('top').querySelectorAll('li').forEach((li, i) => {
        const p = srv.top_players[i];
        li.querySelector('.player').textContent = p ? p.name : '–';
        li.querySelector('.score').textContent = p ? fmt.format(p.kills) + ' kills' : '';
      });
    }
  }

  function loadServers() {
    fetch(SITE_API)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        const bySlug = new Map(d.servers.map((srv) => [srv.slug, srv]));
        liveCards.forEach((card) => {
          const srv = bySlug.get(card.dataset.vipServer);
          if (srv) renderCard(card, srv);
        });
      })
      .catch(() => {}); // sem resposta: mantém o que já está nos cards
  }

  if (liveCards.length) {
    loadServers();
    setInterval(() => { if (!document.hidden) loadServers(); }, 60000);
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
