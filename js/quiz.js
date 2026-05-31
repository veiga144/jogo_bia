'use strict';

// Estado do quiz
const Quiz = {
  perguntas: [],       // 6 perguntas do mundo
  indice: 0,           // pergunta atual (0-5)
  numDicas: 0,         // dicas usadas nesta pergunta
  respondida: false,
  acertouPrimeira: false,
};

function iniciarQuiz() {
  Quiz.perguntas = G.perguntasAtual;
  Quiz.indice = 0;
  mostrarPergunta();
}

function mostrarPergunta() {
  const p = Quiz.perguntas[Quiz.indice];
  Quiz.numDicas = 0;
  Quiz.respondida = false;
  Quiz.acertouPrimeira = true;

  // Atualizar progresso
  const mundo = G.mundoAtual;
  document.getElementById('quiz-mundo-nome').textContent = mundo ? mundo.nome : '';
  const total = 6;
  const pct = (Quiz.indice / total) * 100;
  document.getElementById('barra-fill').style.width = pct + '%';
  document.getElementById('quiz-progresso-texto').textContent = `${Quiz.indice + 1}/6`;
  document.getElementById('quiz-moedas').textContent = G.perfil ? G.perfil.moedas : 0;

  // Pergunta
  document.getElementById('quiz-pergunta').textContent = p.pergunta;

  // Narrar pergunta
  narrar(p.pergunta);

  // Opções
  const divOpcoes = document.getElementById('quiz-opcoes');
  divOpcoes.innerHTML = '';
  p.opcoes.forEach((op, i) => {
    const btn = document.createElement('button');
    btn.className = 'btn-opcao';
    btn.textContent = op;
    btn.addEventListener('click', () => responder(i, p, btn));
    divOpcoes.appendChild(btn);
  });

  // Painel de dicas
  const painel = document.getElementById('painel-dicas');
  painel.classList.remove('oculto');
  document.getElementById('texto-dica').parentElement.classList.remove('visivel');
  document.getElementById('btn-dica').textContent = '💡 Pedir ajuda à Beatriz';
  document.getElementById('btn-dica').disabled = false;

  mostrarEcra('ecra-quiz');
}

function responder(indiceResposta, pergunta, btnClicado) {
  if (Quiz.respondida) return;
  Quiz.respondida = true;

  const correta = pergunta.resposta_correta;
  const acertou = indiceResposta === correta;

  // Desabilitar todos os botões
  document.querySelectorAll('.btn-opcao').forEach((btn, i) => {
    btn.disabled = true;
    if (i === correta) btn.classList.add('correta');
  });

  if (!acertou) {
    btnClicado.classList.add('errada');
    Quiz.acertouPrimeira = false;
  }

  // Moedas
  let moedasGanhas = 0;
  if (acertou) {
    moedasGanhas += 10;
    if (Quiz.acertouPrimeira) moedasGanhas += 5;
    adicionarMoedas(moedasGanhas);
  }

  // Mostrar ecrã de resultado após 600ms
  setTimeout(() => mostrarResultado(acertou, pergunta.curiosidade, moedasGanhas), 600);
}

function mostrarResultado(acertou, curiosidade, moedasGanhas) {
  document.getElementById('resultado-icone').textContent = acertou ? '✅' : '❌';
  document.getElementById('resultado-titulo').textContent = acertou
    ? (Quiz.acertouPrimeira ? 'Muito bem! 🌟' : 'Correto! 👍')
    : 'Não há mal em errar! É a errar que nós aprendemos! 💪';

  const mDiv = document.getElementById('resultado-moedas-ganhas');
  mDiv.textContent = moedasGanhas > 0 ? `+${moedasGanhas} 🪙` : '';

  document.getElementById('resultado-curiosidade').textContent = curiosidade;

  if (acertou) celebrar();

  mostrarEcra('ecra-resultado');
}

document.getElementById('btn-continuar-resultado').addEventListener('click', () => {
  Quiz.indice++;

  // Após pergunta 3 (índice 3), fazer o mini-jogo
  if (Quiz.indice === 3) {
    iniciarMiniJogo(G.mundoAtual.minijogo);
    return;
  }

  // Após pergunta 6 (índice 6), concluir mundo
  if (Quiz.indice >= 6) {
    concluirMundo();
    return;
  }

  mostrarPergunta();
});

// =====================================================================
// DICAS DA BEATRIZ
// =====================================================================
document.getElementById('btn-dica').addEventListener('click', () => {
  const p = Quiz.perguntas[Quiz.indice];
  if (Quiz.numDicas >= p.dicas.length) return;

  const dica = p.dicas[Quiz.numDicas];
  Quiz.numDicas++;
  Quiz.acertouPrimeira = false; // usou dica, não conta como primeira tentativa

  const balao = document.getElementById('texto-dica').parentElement;
  balao.classList.add('visivel');
  document.getElementById('texto-dica').textContent = `Beatriz diz: "${dica}"`;

  if (Quiz.numDicas >= p.dicas.length) {
    document.getElementById('btn-dica').textContent = '(Sem mais dicas)';
    document.getElementById('btn-dica').disabled = true;
  } else {
    document.getElementById('btn-dica').textContent = `💡 Mais uma dica (${Quiz.numDicas}/2)`;
  }
});

// =====================================================================
// CONCLUSÃO DO MUNDO
// =====================================================================
function concluirMundo() {
  const mundo = G.mundoAtual;
  const p = G.perfil;

  // Bónus de conclusão
  adicionarMoedas(50);

  if (!p.mundosCompletos.includes(mundo.id)) {
    p.mundosCompletos.push(mundo.id);
    p.medalhas.push(mundo.id);
  }
  guardarEstado();

  document.getElementById('conclusao-medalha').textContent = mundo.emoji;
  document.getElementById('conclusao-titulo').textContent = `${mundo.nome} Completo!`;
  document.getElementById('conclusao-subtitulo').textContent = `Parabéns! Exploraste o mundo de ${mundo.nome}!`;
  document.getElementById('conclusao-moedas').textContent = p.moedas;
  document.getElementById('conclusao-medalha-texto').textContent = `🏅 Medalha de ${mundo.nome} ganha!`;

  celebrar();
  mostrarEcra('ecra-conclusao');
}

document.getElementById('btn-voltar-mapa').addEventListener('click', () => {
  irParaMapa();
});

// =====================================================================
// WEB SPEECH API – narração em pt-PT
// =====================================================================
function narrar(texto) {
  if (!G.somAtivo) return;
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(texto);
  utt.lang = 'pt-PT';
  utt.rate = 0.95;
  // Tentar usar voz portuguesa se disponível
  const vozes = window.speechSynthesis.getVoices();
  const voz = vozes.find(v => v.lang.startsWith('pt'));
  if (voz) utt.voice = voz;
  window.speechSynthesis.speak(utt);
}
