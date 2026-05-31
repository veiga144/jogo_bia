'use strict';

// =====================================================================
// ESTADO GLOBAL DO JOGO
// =====================================================================
const G = {
  perfis: [],
  perfilAtivo: null,
  mundos: [],
  mundoAtual: null,
  perguntasAtual: [],
  etapaAtual: 0,
  somAtivo: true,

  get perfil() { return G.perfis[G.perfilAtivo]; },
};

// =====================================================================
// NAVEGAÇÃO ENTRE ECRÃS
// =====================================================================
function mostrarEcra(id) {
  document.querySelectorAll('.ecra').forEach(e => e.classList.remove('ativo'));
  const ecra = document.getElementById(id);
  if (ecra) ecra.classList.add('ativo');

  const noMapa = (id === 'ecra-mapa');
  const mapaEl = document.querySelector('.mapa-container');
  if (mapaEl) mapaEl.style.display = noMapa ? 'block' : 'none';

  // se saímos do mapa, remover pinos do body
  if (!noMapa) {
    document.querySelectorAll('.pino-mapa').forEach(el => el.remove());
  }
}

// =====================================================================
// localStorage
// =====================================================================
function guardarEstado() {
  localStorage.setItem('planeta_perfis', JSON.stringify(G.perfis));
  localStorage.setItem('planeta_perfil_ativo', String(G.perfilAtivo));
}

function carregarEstado() {
  const raw = localStorage.getItem('planeta_perfis');
  if (raw) G.perfis = JSON.parse(raw);
  const idx = localStorage.getItem('planeta_perfil_ativo');
  G.perfilAtivo = idx !== null ? parseInt(idx, 10) : null;
}

// =====================================================================
// PERFIL PADRÃO
// =====================================================================
function criarPerfilVazio(nickname, idade) {
  return {
    id: Date.now().toString(),
    nickname: nickname || 'Explorador',
    idade: idade || 8,
    avatar: { animal: 'leao' },
    moedas: 0,
    mundosCompletos: [],
    medalhas: [],
    acessoriosAtivos: [],
  };
}

// =====================================================================
// RENDERIZAR AVATAR COM FOTO REAL
// Retorna elemento DOM pronto a inserir
// =====================================================================
function criarElementoAvatar(av, tamanho) {
  const t = tamanho || 44;
  const animalId = (av && av.animal) || 'leao';
  const animal = (typeof ANIMAIS !== 'undefined' && ANIMAIS.find(a => a.id === animalId)) || { emoji: '🐾', nome: '?' };

  const wrap = document.createElement('div');
  wrap.className = 'avatar-circulo';
  wrap.style.cssText = `width:${t}px;height:${t}px;`;

  const img = document.createElement('img');
  img.src = `imagens/animais/${animalId}.jpg`;
  img.alt = animal.nome;
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;';

  const fallback = document.createElement('div');
  fallback.className = 'avatar-emoji-fb';
  fallback.style.display = 'none';
  fallback.style.fontSize = Math.round(t * 0.55) + 'px';
  fallback.textContent = animal.emoji;

  img.onerror = () => {
    img.style.display = 'none';
    fallback.style.display = 'flex';
  };

  wrap.appendChild(img);
  wrap.appendChild(fallback);
  return wrap;
}

// =====================================================================
// ECRÃ DE PERFIS
// =====================================================================
function renderizarPerfis() {
  const lista = document.getElementById('lista-perfis');
  lista.innerHTML = '';
  G.perfis.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'perfil-card';

    const avatarEl = criarElementoAvatar(p.avatar, 52);
    div.appendChild(avatarEl);

    const info = document.createElement('div');
    info.className = 'perfil-info';
    info.innerHTML = `
      <div class="nome">${p.nickname}</div>
      <div class="detalhes">${p.idade} anos · ${p.mundosCompletos.length} mundos</div>
    `;
    div.appendChild(info);

    const moedas = document.createElement('div');
    moedas.className = 'perfil-moedas';
    moedas.textContent = `🪙 ${p.moedas}`;
    div.appendChild(moedas);

    div.addEventListener('click', () => selecionarPerfil(i));
    lista.appendChild(div);
  });
}

function selecionarPerfil(idx) {
  G.perfilAtivo = idx;
  guardarEstado();
  irParaMapa();
}

document.getElementById('btn-novo-perfil').addEventListener('click', async () => {
  // Garantir que os animais estão carregados antes de mostrar o criador
  if (typeof ANIMAIS === 'undefined' || ANIMAIS.length === 0) {
    await carregarAnimais();
  }
  renderizarSeletorAnimais();
  mostrarEcra('ecra-criador');
});

// =====================================================================
// MAPA
// =====================================================================
async function irParaMapa() {
  atualizarHUD();
  mostrarEcra('ecra-mapa');
  // aguardar um frame para garantir que o ecrã está visível
  requestAnimationFrame(() => renderizarPinos());
}

function atualizarHUD() {
  const p = G.perfil;
  if (!p) return;
  document.getElementById('hud-moedas').textContent = p.moedas;
  document.getElementById('quiz-moedas').textContent = p.moedas;

  // Avatar no HUD
  const hudWrap = document.getElementById('hud-avatar-wrap');
  if (hudWrap) {
    hudWrap.innerHTML = '';
    hudWrap.appendChild(criarElementoAvatar(p.avatar, 44));
  }
}

function renderizarPinos() {
  // Remover pinos anteriores do body
  document.querySelectorAll('.pino-mapa').forEach(el => el.remove());

  if (!G.mundos || G.mundos.length === 0) return;

  G.mundos.forEach(m => {
    const completo = G.perfil && G.perfil.mundosCompletos.includes(m.id);
    const bloqueado = !m.desbloqueado;

    // Posição: left = % da largura do viewport
    // top = HUD (64px) + % da área do mapa abaixo do HUD
    const leftPct  = m.pin_x + '%';
    const topCalc  = `calc(64px + ${m.pin_y / 100} * (100vh - 64px))`;

    const pino = document.createElement('div');
    pino.className = 'pino-mapa';
    // Tudo em inline style para não depender de CSS externo
    pino.style.cssText = `
      position: fixed !important;
      left: ${leftPct};
      top: ${topCalc};
      transform: translate(-50%, -50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: ${bloqueado ? 'not-allowed' : 'pointer'};
      transition: transform .18s;
      pointer-events: all;
    `;

    // Anel de pulsar
    if (!bloqueado && !completo) {
      const pulso = document.createElement('div');
      pulso.style.cssText = `
        position: absolute;
        width: 58px; height: 58px;
        border-radius: 50%;
        border: 3px solid rgba(255,255,255,0.85);
        animation: pulsar-pino 2s ease-out infinite;
        pointer-events: none;
      `;
      pino.appendChild(pulso);
    }

    // Círculo colorido
    const circulo = document.createElement('div');
    circulo.style.cssText = `
      width: 58px; height: 58px;
      border-radius: 50%;
      background: ${m.cor};
      border: 3px solid white;
      box-shadow: 0 4px 14px rgba(0,0,0,0.8), 0 0 0 4px rgba(0,0,0,0.35);
      display: flex; align-items: center; justify-content: center;
      font-size: 30px;
      position: relative;
    `;
    circulo.textContent = bloqueado ? '🔒' : m.emoji;
    pino.appendChild(circulo);

    // Medalha
    if (completo) {
      const med = document.createElement('div');
      med.style.cssText = 'position:absolute;top:-18px;font-size:20px;';
      med.textContent = '🏅';
      circulo.appendChild(med);
    }

    // Etiqueta com o nome
    const nome = document.createElement('div');
    nome.style.cssText = `
      margin-top: 6px;
      background: rgba(0,0,0,0.8);
      color: white;
      font: 700 12px/1 'Segoe UI', sans-serif;
      padding: 4px 12px;
      border-radius: 12px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.6);
    `;
    nome.textContent = m.nome;
    pino.appendChild(nome);

    if (!bloqueado) {
      pino.addEventListener('click', () => iniciarMundo(m.id));
      pino.addEventListener('mouseenter', () => {
        pino.style.transform = 'translate(-50%, -50%) scale(1.2)';
      });
      pino.addEventListener('mouseleave', () => {
        pino.style.transform = 'translate(-50%, -50%)';
      });
    }

    document.body.appendChild(pino); // directamente no body
  });
}

// =====================================================================
// INICIAR MUNDO
// =====================================================================
async function iniciarMundo(idMundo) {
  const mundo = G.mundos.find(m => m.id === idMundo);
  if (!mundo) return;
  G.mundoAtual = mundo;

  const resp = await fetch(`dados/${idMundo}.json`);
  const dados = await resp.json();
  G.perguntasAtual = dados.perguntas;
  G.etapaAtual = 0;

  iniciarQuiz();
}

// =====================================================================
// SOM
// =====================================================================
document.getElementById('btn-som').addEventListener('click', () => {
  G.somAtivo = !G.somAtivo;
  document.getElementById('btn-som').textContent = G.somAtivo ? '🔊' : '🔇';
});

// =====================================================================
// RECOMPENSAS
// =====================================================================
function adicionarMoedas(n) {
  if (!G.perfil) return;
  G.perfil.moedas += n;
  guardarEstado();
  atualizarHUD();
  animarMoedas(n);
}

function animarMoedas(n) {
  const el = document.createElement('div');
  el.className = 'moeda-anim';
  el.textContent = `+${n}🪙`;
  el.style.left = '50%';
  el.style.top = '30%';
  el.style.transform = 'translate(-50%,-50%)';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function celebrar() {
  const emojis = ['⭐','🌟','✨','🎉','🎊'];
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'estrela-anim';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = (20 + Math.random() * 60) + '%';
      el.style.top = (20 + Math.random() * 60) + '%';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1100);
    }, i * 120);
  }
}

// =====================================================================
// GUARDA-ROUPA — ACESSÓRIOS PARA O ANIMAL
// =====================================================================
document.getElementById('btn-guarda-roupa').addEventListener('click', abrirGuardaRoupa);
document.getElementById('btn-fechar-guarda-roupa').addEventListener('click', () => mostrarEcra('ecra-mapa'));

function abrirGuardaRoupa() {
  document.getElementById('gr-moedas').textContent = G.perfil.moedas;
  const grAvatar = document.getElementById('gr-avatar-div');
  if (grAvatar) {
    grAvatar.innerHTML = '';
    grAvatar.appendChild(criarElementoAvatar(G.perfil.avatar, 130));
    // Mostrar acessório activo por cima
    const acess = G.perfil.acessoriosAtivos || [];
    if (acess.length > 0) {
      const badge = document.createElement('div');
      badge.className = 'gr-acessorio-badge';
      badge.textContent = acess[acess.length - 1];
      grAvatar.appendChild(badge);
    }
  }
  renderizarLojaAcessorios();
  mostrarEcra('ecra-guarda-roupa');
}

function renderizarLojaAcessorios() {
  const loja = document.getElementById('gr-loja');
  loja.innerHTML = '';

  const acessorios = [
    { emoji: '🎩', label: 'Chapéu alto',     preco: 0   },
    { emoji: '👑', label: 'Coroa',            preco: 80  },
    { emoji: '🌸', label: 'Flor',             preco: 0   },
    { emoji: '🎀', label: 'Laço',             preco: 50  },
    { emoji: '🕶️', label: 'Óculos de sol',   preco: 60  },
    { emoji: '⭐', label: 'Estrela',          preco: 40  },
    { emoji: '🦋', label: 'Borboleta',        preco: 70  },
    { emoji: '🍀', label: 'Trevo',            preco: 30  },
    { emoji: '🎸', label: 'Guitarra',         preco: 120 },
    { emoji: '🏆', label: 'Troféu',           preco: 150 },
  ];

  const div = document.createElement('div');
  div.className = 'gr-categoria';
  div.innerHTML = '<h3>Acessórios</h3>';
  const grid = document.createElement('div');
  grid.className = 'gr-items';

  acessorios.forEach(ac => {
    const ativo = (G.perfil.acessoriosAtivos || []).includes(ac.emoji);
    const podeComprar = ac.preco === 0 || G.perfil.moedas >= ac.preco;
    const btn = document.createElement('div');
    btn.className = `gr-item${ativo ? ' ativo' : ''}${!podeComprar ? ' bloqueado' : ''}`;
    btn.innerHTML = `
      <div class="gr-emoji">${ac.emoji}</div>
      <div>${ac.label}</div>
      <div class="gr-preco">${ac.preco === 0 ? 'Grátis' : `🪙 ${ac.preco}`}</div>
    `;
    if (podeComprar) {
      btn.addEventListener('click', () => {
        if (ac.preco > 0 && !ativo) {
          if (G.perfil.moedas < ac.preco) return;
          G.perfil.moedas -= ac.preco;
        }
        // Ativar/desativar acessório
        if (!G.perfil.acessoriosAtivos) G.perfil.acessoriosAtivos = [];
        if (ativo) {
          G.perfil.acessoriosAtivos = G.perfil.acessoriosAtivos.filter(e => e !== ac.emoji);
        } else {
          G.perfil.acessoriosAtivos = [ac.emoji]; // Um de cada vez
        }
        guardarEstado();
        abrirGuardaRoupa();
      });
    }
    grid.appendChild(btn);
  });

  div.appendChild(grid);
  loja.appendChild(div);
}

// =====================================================================
// ARRANQUE
// =====================================================================
async function init() {
  carregarEstado();

  // 1.º await: o browser carrega avatar.js, quiz.js, minigames.js enquanto espera
  const mundosResp = await fetch('dados/mundos.json');
  G.mundos = await mundosResp.json();

  // Agora avatar.js já está carregado → carregarAnimais está definida
  await carregarAnimais();

  renderizarPerfis();

  if (G.perfis.length > 0 && G.perfilAtivo !== null && G.perfis[G.perfilAtivo]) {
    irParaMapa();
  } else {
    mostrarEcra('ecra-perfis');
  }
}

init();
