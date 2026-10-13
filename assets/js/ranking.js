/* Ranking dos servidores. Dados de exemplo até integrar com a fonte real. */
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
      name: 'Wardogs', map: 'king-of-the-hill',
      desc: 'Servidor da divisão de Wardogs, com partidas organizadas aos sábados e aberto à comunidade no restante da semana.',
      stats: [['Online', '42/100'], ['Mapa', 'Bakurani'], ['Slots', '100'], ['Local', 'São Paulo']],
      unit: 'pts',
      players: [
        ['Rook', 864, 201, 140, '26h'], ['Vieira', 790, 188, 150, '24h'], ['Nomad', 742, 170, 139, '22h'],
        ['Ghost_BR', 701, 160, 131, '21h'], ['Falcão', 668, 149, 128, '20h'], ['Dente', 630, 141, 130, '18h'],
        ['Karen_01', 598, 133, 119, '17h'], ['Mago', 571, 128, 121, '16h'], ['Cabo_Lucas', 540, 120, 112, '15h'],
        ['Sombra', 512, 114, 110, '14h'], ['Trovão', 488, 108, 104, '13h'], ['Pedrão', 455, 100, 99, '12h'],
        ['Mika', 430, 94, 96, '11h'], ['Bruxo', 402, 88, 90, '10h'], ['Lobo', 377, 81, 84, '9h'],
      ],
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

  document.title = `Ranking ${srv.name} — Vanguarda`;
  const hero = document.getElementById('top');
  hero.dataset.map = srv.map;
  document.getElementById('rankServerName').textContent = srv.name;
  document.getElementById('rankServerDesc').textContent = srv.desc;
  document.getElementById('rankStats').innerHTML = srv.stats.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  document.getElementById('rankUpdated').textContent = 'Atualizado em ' + new Date().toLocaleDateString('pt-BR');
  document.querySelectorAll('#rankTabs a').forEach((a) => a.classList.toggle('active', a.dataset.server === key));

  const tbody = document.querySelector('#rankTable tbody');
  const fmt = (n) => n.toLocaleString('pt-BR');
  function render(filter) {
    const q = (filter || '').trim().toLowerCase();
    tbody.innerHTML = srv.players.map(([nick, pts, k, d, time], i) => {
      if (q && !nick.toLowerCase().includes(q)) return '';
      const pos = i + 1;
      const medal = pos <= 3 ? `<i class="fa-solid fa-medal rank-${pos}"></i>` : pos;
      return `<tr class="${pos <= 3 ? 'top' : ''}">
        <td class="col-pos">${medal}</td>
        <td class="col-player">${nick}</td>
        <td class="num strong">${fmt(pts)}</td>
        <td class="num">${fmt(k)}</td>
        <td class="num">${fmt(d)}</td>
        <td class="num">${(k / Math.max(d, 1)).toFixed(2)}</td>
        <td class="num mono">${time}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="7" class="center muted">Nenhum jogador encontrado.</td></tr>';
  }
  render('');
  document.getElementById('rankSearch').addEventListener('input', (e) => render(e.target.value));
})();
