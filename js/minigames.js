'use strict';

function iniciarMiniJogo(tipo) {
  const area = document.getElementById('minijogo-area');
  area.innerHTML = '';
  document.getElementById('minijogo-estado').textContent = '';
  mostrarEcra('ecra-minijogo');

  if (tipo === 'pizza') miniJogoPizza();
  else if (tipo === 'lixo') miniJogoOceano();
  else if (tipo === 'piramide') miniJogoPiramide();
  else if (tipo === 'sushi') miniJogoSushi();
}

// =====================================================================
// MINI-JOGO 1: PIZZA (Itália)
// Toca nos 3 ingredientes corretos para completar a pizza Margherita!
// =====================================================================
function miniJogoPizza() {
  document.getElementById('minijogo-titulo').textContent = '🍕 Montar a Pizza!';
  document.getElementById('minijogo-instrucao').textContent =
    'Escolhe os 3 ingredientes da Pizza Margherita!';

  const ingredientes = [
    { nome: 'Molho de Tomate', emoji: '🍅', correto: true },
    { nome: 'Mozzarella', emoji: '🧀', correto: true },
    { nome: 'Manjericão', emoji: '🌿', correto: true },
    { nome: 'Ananás', emoji: '🍍', correto: false },
    { nome: 'Chocolate', emoji: '🍫', correto: false },
    { nome: 'Peixe', emoji: '🐟', correto: false },
  ];

  // Misturar
  for (let i = ingredientes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ingredientes[i], ingredientes[j]] = [ingredientes[j], ingredientes[i]];
  }

  let colocados = 0;
  const total = 3;

  const area = document.getElementById('minijogo-area');
  area.innerHTML = `
    <div class="pizza-area">
      <div class="pizza-base">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Base da pizza -->
          <circle cx="100" cy="100" r="92" fill="#F4A261"/>
          <circle cx="100" cy="100" r="78" fill="#E76F51" opacity="0.6"/>
          <circle cx="100" cy="100" r="78" fill="#fff0e0" opacity="0.5"/>
          <!-- Ingredientes adicionados dinamicamente -->
          <g id="pizza-topping-layer"></g>
          <!-- Borda -->
          <circle cx="100" cy="100" r="92" fill="none" stroke="#D4874A" stroke-width="6"/>
        </svg>
      </div>
      <div class="ingredientes-grid" id="ingredientes-grid"></div>
    </div>
  `;

  const grid = document.getElementById('ingredientes-grid');
  const toppingLayer = document.getElementById('pizza-topping-layer');
  const toppingPositions = [
    {cx:80,cy:80}, {cx:120,cy:80}, {cx:100,cy:110},
    {cx:70,cy:115}, {cx:130,cy:115}, {cx:100,cy:75},
  ];
  let toppingIdx = 0;

  ingredientes.forEach(ing => {
    const btn = document.createElement('button');
    btn.className = 'btn-ingrediente';
    btn.innerHTML = `<span class="emoji">${ing.emoji}</span><span>${ing.nome}</span>`;

    btn.addEventListener('click', () => {
      if (btn.disabled) return;

      if (ing.correto) {
        btn.classList.add('colocado');
        btn.disabled = true;
        colocados++;

        // Adicionar topping à pizza
        const pos = toppingPositions[toppingIdx++] || {cx:100,cy:100};
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.cx);
        text.setAttribute('y', pos.cy + 8);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '24');
        text.textContent = ing.emoji;
        toppingLayer.appendChild(text);

        document.getElementById('minijogo-estado').textContent =
          `${colocados}/${total} ingredientes! ${colocados === total ? '🎉' : ''}`;

        if (colocados === total) {
          setTimeout(() => concluirMiniJogo(), 1200);
        }

      } else {
        btn.classList.add('errado');
        setTimeout(() => btn.classList.remove('errado'), 500);
        document.getElementById('minijogo-estado').textContent =
          'Esse ingrediente não vai nesta pizza! Tenta outro! 😄';
      }
    });

    grid.appendChild(btn);
  });

  document.getElementById('minijogo-estado').textContent = `0/${total} ingredientes colocados`;
}

// =====================================================================
// MINI-JOGO 2: OCEANO (Oceanos)
// Toca no lixo para recolhê-lo! Apanha 12 peças em 40 segundos.
// =====================================================================
function miniJogoOceano() {
  document.getElementById('minijogo-titulo').textContent = '🌊 Limpar o Oceano!';
  document.getElementById('minijogo-instrucao').textContent =
    'Toca no lixo para o recolher! Apanha 12 peças!';

  const area = document.getElementById('minijogo-area');
  area.innerHTML = `
    <div class="oceano-area" id="oceano-area">
      <div class="oceano-bolhas" id="oceano-bolhas"></div>
      <div class="oceano-hud">
        <span>🗑️ <span id="oc-recolhido">0</span>/12</span>
        <span>⏱️ <span id="oc-tempo">40</span>s</span>
      </div>
    </div>
  `;

  const oceanoArea = document.getElementById('oceano-area');

  // Criar bolhas decorativas
  const bolhasEl = document.getElementById('oceano-bolhas');
  for (let i = 0; i < 8; i++) {
    const b = document.createElement('div');
    b.className = 'bolha';
    const tam = 8 + Math.random() * 16;
    b.style.cssText = `
      width:${tam}px; height:${tam}px;
      left:${Math.random()*100}%;
      bottom:${Math.random()*20}%;
      animation-duration:${4+Math.random()*4}s;
      animation-delay:${Math.random()*3}s;
    `;
    bolhasEl.appendChild(b);
  }

  const lixoEmojis = ['🍶','🛢️','🥤','🧴','🛍️','🥫','🪣','🧃'];
  let recolhido = 0;
  let tempoRestante = 40;
  let lixoAtivos = 0;
  const maxLixo = 5;
  let jogo_ativo = true;

  function criarLixo() {
    if (!jogo_ativo || lixoAtivos >= maxLixo) return;
    lixoAtivos++;
    const el = document.createElement('div');
    el.className = 'lixo-item';
    el.textContent = lixoEmojis[Math.floor(Math.random() * lixoEmojis.length)];
    const x = 5 + Math.random() * 85;
    const y = 15 + Math.random() * 70;
    el.style.left = x + '%';
    el.style.top = y + '%';
    el.style.animationDuration = (2 + Math.random() * 2) + 's';

    el.addEventListener('click', () => {
      if (!jogo_ativo) return;
      el.style.transform = 'scale(0)';
      el.style.opacity = '0';
      el.style.transition = 'all 0.3s';
      setTimeout(() => { el.remove(); lixoAtivos--; }, 300);

      recolhido++;
      document.getElementById('oc-recolhido').textContent = recolhido;
      document.getElementById('minijogo-estado').textContent =
        `Muito bem! ${recolhido}/12 recolhidos 🌊`;

      if (recolhido >= 12) {
        jogo_ativo = false;
        clearInterval(timer);
        clearInterval(spawner);
        setTimeout(() => concluirMiniJogo(), 800);
      } else {
        setTimeout(criarLixo, 600);
      }
    });

    oceanoArea.appendChild(el);
  }

  // Spawnar lixo inicial
  for (let i = 0; i < 3; i++) setTimeout(criarLixo, i * 400);

  const spawner = setInterval(() => {
    if (jogo_ativo && lixoAtivos < maxLixo) criarLixo();
  }, 2000);

  const timer = setInterval(() => {
    if (!jogo_ativo) return;
    tempoRestante--;
    const elTempo = document.getElementById('oc-tempo');
    if (elTempo) elTempo.textContent = tempoRestante;

    if (tempoRestante <= 0) {
      jogo_ativo = false;
      clearInterval(timer);
      clearInterval(spawner);
      document.getElementById('minijogo-estado').textContent =
        `Recolheste ${recolhido} peças! Bom trabalho!`;
      setTimeout(() => concluirMiniJogo(), 1200);
    }
  }, 1000);
}

// =====================================================================
// MINI-JOGO 3: PIRÂMIDE (Egito)
// Toca nos blocos do maior para o menor para construir a pirâmide!
// =====================================================================
function miniJogoPiramide() {
  document.getElementById('minijogo-titulo').textContent = '🏛️ Construir a Pirâmide!';
  document.getElementById('minijogo-instrucao').textContent =
    'Toca nos blocos do MAIOR para o MENOR!';

  const area = document.getElementById('minijogo-area');
  area.innerHTML = `
    <div class="piramide-area">
      <div class="piramide-construcao" id="piramide-construcao"></div>
      <div class="blocos-disponiveis" id="blocos-disponiveis"></div>
    </div>
  `;

  const blocos = [
    { id: 1, largura: 200, cor: '#E9C46A', label: 'Bloco 1 (o maior)' },
    { id: 2, largura: 160, cor: '#F4A261', label: 'Bloco 2' },
    { id: 3, largura: 120, cor: '#E76F51', label: 'Bloco 3' },
    { id: 4, largura: 80,  cor: '#E9C46A', label: 'Bloco 4' },
    { id: 5, largura: 50,  cor: '#F4A261', label: 'Bloco 5 (o menor)' },
  ];

  let proximoEsperado = 1;
  let construidos = 0;

  // Misturar os blocos para mostrar em ordem aleatória
  const misturados = [...blocos];
  for (let i = misturados.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [misturados[i], misturados[j]] = [misturados[j], misturados[i]];
  }

  const disponiveis = document.getElementById('blocos-disponiveis');
  const construcao = document.getElementById('piramide-construcao');

  misturados.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'btn-bloco';
    btn.id = `bloco-btn-${b.id}`;
    btn.style.cssText = `width:${b.largura}px; background:${b.cor}; color:white;`;
    btn.innerHTML = `${b.id === 1 ? '⬛ Grande' : b.id === 5 ? '◼ Pequeno' : `◼ Bloco ${b.id}`}`;

    btn.addEventListener('click', () => {
      if (b.id === proximoEsperado) {
        // Correto!
        btn.disabled = true;
        btn.style.opacity = '0.3';
        construidos++;
        proximoEsperado++;

        // Adicionar à pirâmide (ordem: maior em baixo, menor em cima)
        // Como construímos de baixo para cima, inserir antes dos existentes
        const blocoEl = document.createElement('div');
        blocoEl.className = 'piramide-bloco';
        blocoEl.style.cssText = `width:${b.largura}px; background:${b.cor}; min-width:${b.largura}px;`;
        blocoEl.textContent = `Bloco ${b.id}`;

        // Inserir no topo (construímos de baixo para cima visualmente)
        construcao.insertBefore(blocoEl, construcao.firstChild);

        document.getElementById('minijogo-estado').textContent =
          `${construidos}/5 blocos colocados! ${construidos === 5 ? '🎉 Pirâmide completa!' : ''}`;

        if (construidos === 5) {
          setTimeout(() => concluirMiniJogo(), 1200);
        }

      } else {
        // Errado!
        btn.classList.add('errado');
        setTimeout(() => btn.classList.remove('errado'), 500);
        document.getElementById('minijogo-estado').textContent =
          'Precisas do bloco maior a seguir! Qual é o maior? 🤔';
      }
    });

    disponiveis.appendChild(btn);
  });

  document.getElementById('minijogo-estado').textContent = 'Começa pelo bloco MAIOR!';
}

// =====================================================================
// MINI-JOGO 4: SUSHI (Japão)
// Tapete rolante de restaurante japonês: toca só nos pratos de comida
// japonesa e apanha 8! Sem tempo limite e sem penalização por errar.
// =====================================================================
function miniJogoSushi() {
  document.getElementById('minijogo-titulo').textContent = '🍣 Apanhar o Sushi!';
  document.getElementById('minijogo-instrucao').textContent =
    'Toca só nos pratos de comida do Japão! Apanha 8!';

  const TOTAL = 8;
  const PRATOS_JAPONESES = [
    { emoji: '🍣', nome: 'Sushi' },
    { emoji: '🍙', nome: 'Onigiri (bolinho de arroz)' },
    { emoji: '🍜', nome: 'Ramen (sopa de massa)' },
    { emoji: '🍱', nome: 'Bento (marmita japonesa)' },
    { emoji: '🍡', nome: 'Dango (bolinhos doces)' },
    { emoji: '🍤', nome: 'Tempura' },
  ];
  const PRATOS_OUTROS = ['🍕', '🍔', '🌭', '🍟', '🌮'];

  const area = document.getElementById('minijogo-area');
  area.innerHTML = `
    <div class="sushi-area" id="sushi-area">
      <div class="sushi-hud">🍣 <span id="su-apanhados">0</span>/${TOTAL}</div>
      <div class="sushi-tapete" id="sushi-lane-0"></div>
      <div class="sushi-tapete" id="sushi-lane-1"></div>
      <div class="sushi-tabuleiro" id="sushi-tabuleiro"></div>
    </div>
  `;

  const areaEl = document.getElementById('sushi-area');
  const estado = document.getElementById('minijogo-estado');
  const tabuleiro = document.getElementById('sushi-tabuleiro');
  for (let i = 0; i < TOTAL; i++) {
    const slot = document.createElement('div');
    slot.className = 'sushi-slot';
    tabuleiro.appendChild(slot);
  }

  // Cada tapete anda num sentido (dir: 1 = esquerda→direita, -1 = direita→esquerda)
  const lanes = [
    { el: document.getElementById('sushi-lane-0'), dir: 1,  segundos: 6.0, proximo: 0 },
    { el: document.getElementById('sushi-lane-1'), dir: -1, segundos: 5.0, proximo: 700 },
  ];

  const PRATO = 76; // largura do prato em px
  let pratos = [];
  let apanhados = 0;
  let ativo = true;
  let ultimo = performance.now();
  let relogio = 0;

  function criarPrato(lane) {
    const japones = Math.random() < 0.65;
    const info = japones
      ? PRATOS_JAPONESES[Math.floor(Math.random() * PRATOS_JAPONESES.length)]
      : { emoji: PRATOS_OUTROS[Math.floor(Math.random() * PRATOS_OUTROS.length)], nome: null };

    const el = document.createElement('div');
    el.className = 'sushi-prato';
    // O emoji vai num elemento interior: as animações (abanar/desaparecer) ficam
    // aí e não interferem com o translateX que move o prato pelo tapete.
    const dentro = document.createElement('span');
    dentro.className = 'sushi-prato-in';
    dentro.textContent = info.emoji;
    el.appendChild(dentro);

    const largura = lane.el.clientWidth || area.clientWidth || 360;
    const velocidade = largura / lane.segundos; // px por segundo
    const prato = {
      el, japones, info, lane,
      x: lane.dir === 1 ? -PRATO : largura,
      v: velocidade * lane.dir,
      largura,
      apanhado: false,
    };
    el.style.transform = `translateX(${prato.x}px)`;

    el.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      if (!ativo || prato.apanhado) return;

      if (prato.japones) {
        prato.apanhado = true;
        apanhados++;
        document.getElementById('su-apanhados').textContent = apanhados;
        tabuleiro.children[apanhados - 1].textContent = info.emoji;
        el.classList.add('apanhado');
        setTimeout(() => el.remove(), 250);
        estado.textContent = apanhados >= TOTAL
          ? '🎉 Itadakimasu! (Bom apetite em japonês!)'
          : `${info.nome}! Muito bem! ${apanhados}/${TOTAL}`;

        if (apanhados >= TOTAL) {
          ativo = false;
          setTimeout(() => concluirMiniJogo(), 1400);
        }
      } else {
        el.classList.remove('errado');
        void el.offsetWidth; // reinicia a animação
        el.classList.add('errado');
        estado.textContent = 'Isso não é comida japonesa! Tenta outro prato 😄';
      }
    });

    lane.el.appendChild(el);
    pratos.push(prato);
  }

  function ciclo(agora) {
    // Parar se o mini-jogo terminou ou se o ecrã já foi trocado
    if (!ativo || !document.body.contains(areaEl)) return;

    const dt = Math.min(agora - ultimo, 50); // evita saltos se o separador ficar em pausa
    ultimo = agora;
    relogio += dt;

    lanes.forEach(lane => {
      if (relogio >= lane.proximo) {
        criarPrato(lane);
        lane.proximo = relogio + 1300 + Math.random() * 700;
      }
    });

    pratos = pratos.filter(pr => {
      if (pr.apanhado) return false;
      pr.x += pr.v * (dt / 1000);
      const fora = pr.lane.dir === 1 ? pr.x > pr.largura : pr.x < -PRATO;
      if (fora) { pr.el.remove(); return false; }
      pr.el.style.transform = `translateX(${pr.x}px)`;
      return true;
    });

    requestAnimationFrame(ciclo);
  }

  estado.textContent = `0/${TOTAL} pratos apanhados`;
  requestAnimationFrame(ciclo);
}

// =====================================================================
// CONCLUIR MINI-JOGO
// =====================================================================
function concluirMiniJogo() {
  adicionarMoedas(20);
  celebrar();
  // Continuar para as perguntas 4-6
  mostrarPergunta();
}
