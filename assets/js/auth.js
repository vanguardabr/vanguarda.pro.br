/* Telas de login e cadastro (login social via Discord). */
(function () {
  const PLANS = ['vip30', 'vip60']; // planos válidos, repassados ao backend
  // Endpoints do backend de autenticação. Ajuste quando a API existir.
  const AUTH_URL = { discord: '/auth/discord' };

  const params = new URLSearchParams(location.search);
  const plan = PLANS.includes(params.get('plano')) ? params.get('plano') : '';

  // alterna entre as telas
  const tabs = document.querySelectorAll('.auth-tabs [data-view]');
  function show(view) {
    document.querySelectorAll('.auth-view').forEach((v) => { v.hidden = v.id !== 'view-' + view; });
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.view === view)));
    document.title = (view === 'signup' ? 'Criar conta' : 'Entrar') + ' — Vanguarda';
    const url = new URL(location.href); url.searchParams.set('tela', view === 'signup' ? 'cadastro' : 'login');
    history.replaceState(null, '', url);
  }
  tabs.forEach((t) => t.addEventListener('click', () => show(t.dataset.view)));
  document.querySelectorAll('[data-goto]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); show(a.dataset.goto); }));
  if (tabs.length) show(params.get('tela') === 'cadastro' ? 'signup' : 'login');

  // monta a URL do provedor levando o plano e os dados do cadastro
  function authUrl(provider, extra) {
    const u = new URL(AUTH_URL[provider], location.origin);
    if (plan) u.searchParams.set('plano', plan);
    Object.entries(extra || {}).forEach(([k, v]) => v && u.searchParams.set(k, v));
    return u.toString();
  }

  // login: botões vão direto ao provedor
  document.querySelectorAll('#view-login [data-provider]').forEach((a) => {
    a.href = authUrl(a.dataset.provider);
  });

  // ---------- busca de jogadores (mock; trocar por chamada à API) ----------
  // Jogos e servidores conhecidos (ícone exibido nas sugestões)
  const GAMES = {
    hll: { name: 'Hell Let Loose', icon: 'assets/img/games/hll.jpg' },
    wardogs: { name: 'Wardogs', icon: 'assets/img/games/wardogs.jpg' },
    cs2: { name: 'Counter-Strike 2', icon: 'assets/img/games/cs2.jpg' },
  };
  const SERVERS = {
    'hll-eventos': { game: 'hll', name: 'HLL · Eventos' },
    'wardogs': { game: 'wardogs', name: 'Wardogs' },
    'cs2-pug': { game: 'cs2', name: 'CS2 · PUG/Mix' },
  };
  // Cada jogador: id, nick usado nos servidores, lista de servidores onde já entrou, e o perfil Steam quando entrou pela Steam.
  const MOCK_PLAYERS = [
    { id: 'p01', nick: 'Sgt.Ferraz', servers: ['hll-eventos', 'wardogs'], steam: { name: 'Ferraz', avatar: 'assets/img/avatars/01.svg', url: 'https://steamcommunity.com/id/ferraz' } },
    { id: 'p02', nick: 'Kowalski', servers: ['hll-eventos'], steam: { name: 'K0walski', avatar: 'assets/img/avatars/02.svg', url: 'https://steamcommunity.com/id/kowalski' } },
    { id: 'p03', nick: 'Dutra_BR', servers: ['hll-eventos', 'cs2-pug'], steam: { name: 'Dutra', avatar: 'assets/img/avatars/03.svg', url: 'https://steamcommunity.com/id/dutra' } },
    { id: 'p04', nick: 'Capivara', servers: ['hll-eventos'], steam: null },
    { id: 'p05', nick: 'Rook', servers: ['wardogs', 'hll-eventos', 'cs2-pug'], steam: { name: 'Rook', avatar: 'assets/img/avatars/04.svg', url: 'https://steamcommunity.com/id/rook' } },
    { id: 'p06', nick: 'Vieira', servers: ['wardogs'], steam: { name: 'vieira.exe', avatar: 'assets/img/avatars/05.svg', url: 'https://steamcommunity.com/id/vieira' } },
    { id: 'p07', nick: 'Nomad', servers: ['wardogs', 'hll-eventos'], steam: null },
    { id: 'p08', nick: 'zkr', servers: ['cs2-pug'], steam: { name: 'zkr', avatar: 'assets/img/avatars/06.svg', url: 'https://steamcommunity.com/id/zkr' } },
    { id: 'p09', nick: 'mnz', servers: ['cs2-pug', 'wardogs'], steam: { name: 'mnz ♛', avatar: 'assets/img/avatars/07.svg', url: 'https://steamcommunity.com/id/mnz' } },
    { id: 'p10', nick: 'tatu', servers: ['cs2-pug'], steam: { name: 'tatu', avatar: 'assets/img/avatars/08.svg', url: 'https://steamcommunity.com/id/tatu' } },
    { id: 'p11', nick: 'Tenente_Rocha', servers: ['hll-eventos'], steam: null },
    { id: 'p12', nick: 'Ghost_BR', servers: ['wardogs', 'cs2-pug'], steam: null },
  ];
  // Simula GET /api/players?q=... com latência. Substituir por fetch() quando a API existir.
  function searchPlayers(query) {
    const q = query.trim().toLowerCase();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_PLAYERS.filter((p) => p.nick.toLowerCase().includes(q) || (p.steam && p.steam.name.toLowerCase().includes(q))).slice(0, 6));
      }, 250);
    });
  }

  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function avatarHtml(p) {
    return p.steam
      ? `<img class="auth-avatar" src="${esc(p.steam.avatar)}" alt="">`
      : `<span class="auth-avatar auth-avatar-placeholder"><i class="fa-solid fa-user"></i></span>`;
  }
  function playerHtml(p) {
    const platform = p.steam
      ? `<span class="auth-platform steam"><i class="fa-brands fa-steam"></i> ${esc(p.steam.name)}</span>`
      : `<span class="auth-platform generic"><i class="fa-solid fa-gamepad"></i> Jogador do servidor</span>`;
    const servers = p.servers.map((id) => {
      const s = SERVERS[id]; const g = s && GAMES[s.game];
      return s ? `<span class="auth-game" title="${esc(g.name)}"><img src="${esc(g.icon)}" alt="${esc(g.name)}">${esc(s.name)}</span>` : '';
    }).join('');
    return `${avatarHtml(p)}<span class="auth-player-info"><strong>${esc(p.nick)}</strong>${platform}<span class="auth-games">${servers}</span></span>`;
  }

  const form = document.getElementById('signupForm');
  const requirePlayer = form.dataset.requirePlayer !== 'false';
  const nickInput = document.getElementById('nickInput');
  const playerId = document.getElementById('playerId');
  const suggest = document.getElementById('nickSuggest');
  const selected = document.getElementById('playerSelected');
  const loading = document.getElementById('nickLoading');
  const hint = document.getElementById('nickHint');
  let timer = null, lastQuery = '', results = [], active = -1;

  function closeSuggest() { suggest.hidden = true; suggest.innerHTML = ''; active = -1; }
  function renderSuggest(list) {
    results = list; active = -1;
    if (!list.length) {
      suggest.innerHTML = requirePlayer
        ? '<li class="auth-suggest-empty">Nenhum jogador com esse nick. Entre em um servidor da Vanguarda pelo menos uma vez e tente de novo.</li>'
        : '<li class="auth-suggest-empty">Nenhum jogador com esse nick nos nossos servidores. Tudo bem, pode continuar sem selecionar.</li>';
    } else {
      suggest.innerHTML = list.map((p, i) => `<li role="option" data-i="${i}" class="auth-suggest-item ${p.steam ? 'is-steam' : 'is-generic'}">${playerHtml(p)}</li>`).join('');
    }
    suggest.hidden = false;
  }
  function choose(p) {
    playerId.value = p.id;
    nickInput.value = p.nick;
    selected.className = 'auth-selected ' + (p.steam ? 'is-steam' : 'is-generic');
    selected.innerHTML = `${playerHtml(p)}<button type="button" class="auth-selected-change" aria-label="Trocar jogador"><i class="fa-solid fa-xmark"></i></button>`;
    selected.hidden = false;
    nickInput.closest('label').hidden = true;
    hint.hidden = true;
    loading.hidden = true;
    clearTimeout(timer);
    closeSuggest();
    nickInput.setCustomValidity('');
  }
  function clearChoice() {
    playerId.value = ''; nickInput.value = '';
    selected.hidden = true; selected.innerHTML = '';
    nickInput.closest('label').hidden = false; hint.hidden = false;
    nickInput.focus();
  }
  nickInput.addEventListener('input', () => {
    playerId.value = '';
    const q = nickInput.value.trim();
    clearTimeout(timer);
    if (q.length < 2) { closeSuggest(); loading.hidden = true; return; }
    loading.hidden = false;
    timer = setTimeout(async () => {
      lastQuery = q;
      const list = await searchPlayers(q);
      if (q !== lastQuery) return; // resposta antiga
      loading.hidden = true;
      renderSuggest(list);
    }, 200);
  });
  nickInput.addEventListener('keydown', (e) => {
    if (suggest.hidden || !results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % results.length; }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + results.length) % results.length; }
    else if (e.key === 'Enter') { e.preventDefault(); if (active >= 0) choose(results[active]); return; }
    else if (e.key === 'Escape') { closeSuggest(); return; }
    else return;
    suggest.querySelectorAll('li').forEach((li, i) => li.classList.toggle('active', i === active));
  });
  suggest.addEventListener('mousedown', (e) => {
    const li = e.target.closest('[data-i]');
    if (li) { e.preventDefault(); choose(results[+li.dataset.i]); }
  });
  nickInput.addEventListener('blur', () => setTimeout(closeSuggest, 150));
  selected.addEventListener('click', (e) => { if (e.target.closest('.auth-selected-change')) clearChoice(); });

  // cadastro: exige um jogador da lista e segue para o Discord
  const provider = 'discord';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (requirePlayer && !playerId.value) {
      nickInput.setCustomValidity('Escolha o seu nick na lista de jogadores.');
      nickInput.reportValidity();
      nickInput.addEventListener('input', () => nickInput.setCustomValidity(''), { once: true });
      return;
    }
    if (!form.reportValidity()) return;
    location.href = authUrl(provider, { jogador: playerId.value, nick: nickInput.value.trim(), novo: '1', origem: form.dataset.origem || '' });
  });
})();
