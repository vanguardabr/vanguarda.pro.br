/* Ranking dos servidores. Wardogs: dados reais pela API do VIP (`vip`, o slug do servidor lá).
   HLL e CS2: dados de exemplo até integrar com a fonte real. */
(function () {
  const SERVERS = {
    hll: {
      name: 'HLL · Eventos', map: 'carentan',
      desc: 'Servidor de Hell Let Loose para eventos, treinos e partidas organizadas da unidade. Vaga reservada para quem doa.',
      stats: [['Online', '64/100'], ['Mapa', 'Carentan'], ['Slots', '100'], ['Local', 'São Paulo']],
      unit: 'pts',
      players: [
        ['Sgt.Ferraz', 1240, 312, 198, '41h'], ['Kowalski', 1115, 287, 210, '38h'], ['Dutra_BR', 980, 240, 190, '35h'],
        ['Capivara', 912, 221, 175, '30h'], ['Tenente_Rocha', 870, 198, 160, '33h'], ['Brutus', 845, 230, 201, '28h'],
        ['Mendes', 810, 176, 142, '27h'], ['Silva.22', 790, 190, 171, '25h'], ['Oliveira_HLL', 744, 165, 150, '24h'],
        ['Garcez', 702, 150, 139, '22h'], ['Pereira', 688, 170, 168, '21h'], ['Fox', 650, 142, 120, '20h'],
        ['Marreco', 622, 131, 118, '19h'], ['Lima_Jr', 598, 125, 121, '18h'], ['Nogueira', 560, 118, 109, '17h'],
        ['Thiagão', 541, 110, 104, '16h'], ['Baiano', 512, 103, 99, '15h'], ['Zé_Grande', 488, 97, 95, '14h'],
        ['Rafa', 450, 90, 88, '13h'], ['Neto', 421, 84, 90, '12h'],
      ],
    },
    wardogs: {
      name: 'Wardogs', map: 'king-of-the-hill', vip: 'vanguarda',
      desc: 'Servidor da divisão de Wardogs, com partidas organizadas aos sábados e aberto à comunidade no restante da semana.',
    },
    cs2: {
      name: 'CS2 · PUG/Mix', map: 'mirage',
      desc: 'Servidor privado de CS2 para PUGs e mix entre membros, com senha no Discord.',
      stats: [['Online', '8/10'], ['Mapa', 'Mirage'], ['Slots', '10'], ['Local', 'Privado']],
      unit: 'pts',
      players: [
        ['zkr', 2210, 1540, 1270, '62h'], ['mnz', 2080, 1410, 1240, '58h'], ['tatu', 1960, 1330, 1230, '55h'],
        ['pedrinho', 1840, 1250, 1190, '50h'], ['dvs', 1720, 1180, 1150, '47h'], ['kabral', 1650, 1120, 1130, '44h'],
        ['lucca', 1570, 1060, 1090, '41h'], ['fnx_jr', 1490, 1010, 1070, '39h'], ['bibi', 1400, 940, 1010, '36h'],
        ['marcos', 1320, 890, 990, '34h'], ['vini', 1240, 830, 960, '31h'], ['tomate', 1150, 770, 930, '29h'],
      ],
    },
  };

  const params = new URLSearchParams(location.search);
  const key = SERVERS[params.get('servidor')] ? params.get('servidor') : 'hll';
  const srv = SERVERS[key];

  const VIP_API = 'https://vip.vanguarda.pro.br/api/v1/site/servers/';

  document.title = `Ranking ${srv.name} — Vanguarda`;
  const hero = document.getElementById('top');
  hero.dataset.map = srv.map;
  document.getElementById('rankServerName').textContent = srv.name;
  document.getElementById('rankServerDesc').textContent = srv.desc;
  document.querySelectorAll('#rankTabs a').forEach((a) => a.classList.toggle('active', a.dataset.server === key));

  const stats = document.getElementById('rankStats');
  const updated = document.getElementById('rankUpdated');
  const dot = document.querySelector('.rank-title .dot');
  const head = document.querySelector('#rankTable thead tr');
  const tbody = document.querySelector('#rankTable tbody');
  const search = document.getElementById('rankSearch');
  const fmt = (n) => n.toLocaleString('pt-BR');
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const kd = (k, d) => (k / Math.max(d, 1)).toFixed(2);
  const hours = (min) => (min >= 60 ? Math.floor(min / 60) + 'h' + (min % 60 ? String(min % 60).padStart(2, '0') : '') : min + 'min');
  const medal = (pos) => (pos <= 3 ? `<i class="fa-solid fa-medal rank-${pos}"></i>` : pos);

  function setStats(list) {
    stats.innerHTML = list.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  }

  // linhas: [posição, nick, células numéricas já formatadas (a primeira em destaque)]
  function renderRows(rows, cols, filter) {
    const q = (filter || '').trim().toLowerCase();
    const html = rows
      .filter(([, nick]) => !q || nick.toLowerCase().includes(q))
      .map(([pos, nick, cells]) => `<tr class="${pos <= 3 ? 'top' : ''}">
        <td class="col-pos">${medal(pos)}</td>
        <td class="col-player">${esc(nick)}</td>
        ${cells.map((c, i) => `<td class="num${i === 0 ? ' strong' : ''}${i === cells.length - 1 ? ' mono' : ''}">${esc(c)}</td>`).join('')}
      </tr>`)
      .join('');
    tbody.innerHTML = html || `<tr><td colspan="${cols}" class="center muted">Nenhum jogador encontrado.</td></tr>`;
  }

  function setHead(labels) {
    head.innerHTML = '<th class="col-pos">#</th><th>Jogador</th>' + labels.map((l) => `<th class="num">${l}</th>`).join('');
  }

  function message(text, cols) {
    tbody.innerHTML = `<tr><td colspan="${cols}" class="center muted">${esc(text)}</td></tr>`;
  }

  let rows = [];
  let cols = 7;
  search.addEventListener('input', (e) => renderRows(rows, cols, e.target.value));

  if (srv.vip) {
    // dados reais: temporada atual, por kills
    setHead(['Kills', 'Mortes', 'K/D', 'Tempo']);
    cols = 6;
    setStats([['Online', '–'], ['Mapa', '–'], ['Slots', '–'], ['Local', 'São Paulo']]);
    dot.classList.replace('online', 'pending');
    updated.textContent = 'Temporada atual, por kills';
    message('Carregando ranking…', cols);

    fetch(VIP_API + encodeURIComponent(srv.vip))
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        const s = d.status;
        if (s && s.online !== null) {
          dot.classList.remove('pending');
          dot.classList.add(s.online ? 'online' : 'offline');
          setStats([
            ['Online', s.online ? (s.players ?? 0) + '/' + (s.max_players ?? '?') : 'Offline'],
            ['Mapa', s.map ? s.map.replace(/_/g, ' ') : '–'],
            ['Slots', s.max_players ?? '–'],
            ['Local', 'São Paulo'],
          ]);
        }
        rows = d.ranking.map((p) => [p.rank, p.name, [fmt(p.kills), fmt(p.deaths), kd(p.kills, p.deaths), hours(p.minutes)]]);
        updated.textContent = `Temporada atual, por kills · atualizado às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        if (rows.length) renderRows(rows, cols, search.value);
        else message('Ninguém no ranking desta temporada ainda.', cols);
      })
      .catch(() => message('Ranking indisponível no momento. Tente de novo em instantes.', cols));
  } else {
    setStats(srv.stats);
    updated.textContent = 'Atualizado em ' + new Date().toLocaleDateString('pt-BR');
    rows = srv.players.map(([nick, pts, k, d, time], i) => [i + 1, nick, [fmt(pts), fmt(k), fmt(d), kd(k, d), time]]);
    renderRows(rows, cols, '');
  }
})();
