# Vanguarda — site completo

Site institucional da Vanguarda, time competitivo brasileiro de CS2, Hell Let Loose e Wardogs. O site apresenta o clã, as modalidades, os servidores, a doação com VIP de brinde e as páginas de login, recrutamento, ranking, regras e privacidade.

É um site estático: HTML, CSS e JavaScript puros, sem framework e sem etapa de build. Basta servir a pasta.

## Como rodar

Qualquer servidor estático funciona. Exemplos:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

Abrir `http://localhost:8080`. Abrir o `index.html` direto no navegador (file://) também funciona para a maior parte das páginas.

Dependências externas, carregadas por CDN:

- Google Fonts: Inter (texto) e Rajdhani (títulos).
- Font Awesome 6.5.2 (ícones), via cdnjs.

## Páginas

| Arquivo | Função |
|---|---|
| `index.html` | Página inicial: hero, por que a Vanguarda, modalidades, doação, servidores e FAQ. |
| `login.html` | Entrar e criar conta via Discord. Recebe `?plano=vip30` ou `?plano=vip60` dos botões de doar e `?tela=cadastro` para abrir direto no cadastro. |
| `recrutamento.html` | Cadastro de recruta via Discord, aberto pelo botão "Estamos recrutando". Mesmo layout do login, sem abas. |
| `ranking.html` | Ranking de um servidor. Recebe `?servidor=hll`, `wardogs` ou `cs2`. Sem parâmetro mostra o HLL. |
| `regras.html` | Regras da comunidade. |
| `privacidade.html` | Política de privacidade. |

Os cards de servidor na página inicial são links para o ranking do servidor correspondente.

## Estrutura

```
completo/
├── index.html, login.html, recrutamento.html, ranking.html, regras.html, privacidade.html
├── assets/
│   ├── css/styles.css        # todo o estilo do site, em seções comentadas
│   ├── js/
│   │   ├── main.js           # navbar, menu mobile, voltar ao topo, slogan digitado, FAQ, ano do rodapé
│   │   ├── ranking.js        # dados e renderização do ranking (mock)
│   │   └── auth.js           # telas de login/cadastro, busca de jogadores (mock), redirecionamento ao Discord
│   └── img/
│       ├── logo.png          # logo do clã
│       ├── camo-oliva.svg    # padrão camuflado do hero e do painel de login
│       ├── mode-*.jpg        # capas dos cards de modalidade (CS2, HLL, Wardogs)
│       ├── maps/             # fundo dos cards de servidor e do cabeçalho do ranking, por mapa
│       ├── games/            # ícones oficiais dos jogos (Steam), usados na busca de jogadores
│       └── avatars/          # avatares de exemplo para os perfis Steam do mock
└── README.md
```

## Tema

As cores ficam em variáveis CSS no bloco `:root`, no topo de `styles.css`. O tema atual é o "oliva": fundo verde-musgo escuro com o vermelho da marca como destaque. Para mudar a paleta, basta trocar os valores dessas variáveis.

O hero usa `camo-oliva.svg` como fundo, com um escurecimento por cima para manter o texto legível. O mesmo tile é usado no painel esquerdo do login e do recrutamento.

Detalhes de comportamento:

- O hero ocupa a tela inteira (`100svh`) e centraliza o conteúdo.
- O slogan da seção "Por que a Vanguarda" alterna quatro frases com efeito de digitação. As frases ficam no atributo `data-phrases` do `h2`.
- As capas das modalidades têm zoom e um efeito glitch no hover. Quem usa "reduzir movimento" no sistema vê tudo estático.
- Os cards de servidor usam `data-map` para escolher a imagem de fundo. Para um mapa novo, colocar a imagem em `assets/img/maps/` e adicionar uma regra em `styles.css` para o novo valor.

## Conteúdo editável

- **Doação**: os três cards (Gratuito, VIP 30 dias, VIP 60 dias) estão em `index.html`, seção `#planos`. Os dez benefícios são os mesmos nos três, mudando só check e X. Os preços também aparecem em `auth.js` (lista de planos válidos) e nos links dos botões de doar.
- **Servidores**: cards em `index.html`, seção `#servidores`. Nome, slots, descrição, estatísticas (online e mapa) e top 3 são texto fixo, de exemplo.
- **FAQ**: `index.html`, seção `#faq`.
- **Regras e privacidade**: texto direto nas páginas. Atualizar a data no cabeçalho ao mudar.

## Mocks e pontos de integração

Tudo que depende de backend está simulado no front, com comentários indicando onde trocar.

### Autenticação (`auth.js`)

- Login e cadastro são só via Discord. Os botões levam para `/auth/discord`, definido na constante `AUTH_URL`, passando na URL:
  - `plano` (vip30 ou vip60), quando veio de um botão de doar;
  - `jogador` (id do jogador escolhido na busca) e `nick`;
  - `novo=1` no cadastro e `origem=recrutamento` quando veio da página de recrutamento.
- O backend deve implementar o OAuth2 do Discord nesse endpoint e, no retorno, vincular o ID do Discord ao jogador.
- Nenhuma senha é pedida nem guardada.

### Busca de jogadores (`auth.js`)

- A função `searchPlayers(query)` simula `GET /api/players?q=` com 250 ms de latência, filtrando a lista `MOCK_PLAYERS`.
- Formato esperado por jogador: `id`, `nick`, `servers` (ids de servidores) e `steam` (`name`, `avatar`, `url`) ou `null` quando não entrou pela Steam.
- Jogadores com perfil Steam são exibidos no tema da Steam, com avatar; os demais ganham um placeholder e o tema genérico.
- Na página de login a escolha de um jogador da lista é obrigatória. No recrutamento é opcional, porque o recruta pode nunca ter entrado num servidor (atributo `data-require-player="false"` no formulário).

### Ranking (`ranking.js`)

- A constante `SERVERS` guarda, por servidor, nome, mapa, descrição, estatísticas e a lista de jogadores (`[nick, pontos, kills, mortes, tempo]`). O K/D é calculado na tela.
- Para integrar, substituir essa constante por uma chamada que devolva o mesmo formato.

### Status dos servidores

Os números de "online" e o mapa atual nos cards são fixos. Com uma API de status, basta atualizar o texto dos `<dd>` e o atributo `data-map` de cada card.

## Imagens e créditos

- Capas das modalidades e fundos dos mapas: artes e screenshots oficiais da Steam de Counter-Strike 2 (Valve), Hell Let Loose (Team17 / Black Matter) e WARDOGS (Bulkhead / Team17). Uso promocional em site de comunidade; substituir por capturas próprias se necessário.
- Ícones dos jogos: ícones oficiais dos apps na Steam.
- Avatares em `assets/img/avatars/` são gerados, só para o mock.
- `camo-oliva.svg` foi gerado por script. Para outra variação, é só regenerar o SVG mantendo o tamanho de 720 px e a repetição sem emenda.

## Pendências conhecidas

- Links "Termos de uso" no rodapé ainda não têm página.
- Links de Instagram e Twitch no rodapé apontam para `#`.
- Os textos de regras e privacidade são uma base e devem ser revisados pela staff antes de publicar.
