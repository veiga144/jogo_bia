'use strict';

// =====================================================================
// LISTA DE ANIMAIS (carregada de dados/animais.json)
// =====================================================================
let ANIMAIS = [];

async function carregarAnimais() {
  const resp = await fetch('dados/animais.json');
  ANIMAIS = await resp.json();
}

// =====================================================================
// RENDER DO AVATAR (usado em perfis, HUD, guarda-roupa)
// Retorna HTML string com <img> + emoji como fallback
// =====================================================================
function avatarAnimalHTML(av, tamanho) {
  const t = tamanho || 44;
  const animal = ANIMAIS.find(a => a.id === (av && av.animal)) || { emoji: '🐾', id: 'default', nome: '?' };
  const src = `imagens/animais/${animal.id}.jpg`;
  return `
    <div class="avatar-circulo" style="width:${t}px;height:${t}px;font-size:${Math.round(t*0.55)}px">
      <img src="${src}" alt="${animal.nome}"
           style="width:100%;height:100%;object-fit:cover;border-radius:50%"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="avatar-emoji-fb" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;border-radius:50%">
        ${animal.emoji}
      </div>
    </div>`;
}

// Versão legada mantida para compatibilidade com o guarda-roupa (só usa o avatar)
function avatarSVGInner(av) {
  const animal = ANIMAIS.find(a => a.id === (av && av.animal)) || { emoji: '🐾' };
  // Retorna um círculo SVG com emoji centrado
  return `<text x="100" y="170" text-anchor="middle" font-size="120">${animal.emoji}</text>`;
}

// =====================================================================
// MASCOTE BEATRIZ — foto real sem fundo
// =====================================================================
function beatrizImgHTML(largura, altura) {
  const w = largura || 80;
  const h = altura  || 110;
  return `<img src="imagens/BIA_sem_fundo.png" alt="Beatriz"
               style="width:${w}px;height:${h}px;object-fit:contain;object-position:top;
                      filter:drop-shadow(0 4px 12px rgba(0,0,0,0.35))">`;
}

// =====================================================================
// CRIADOR DE PERSONAGEM — SELEÇÃO DE ANIMAL
// =====================================================================
let animalSelecionado = null;

function renderizarSeletorAnimais() {
  const grid = document.getElementById('animais-grid');
  if (!grid || ANIMAIS.length === 0) return;
  grid.innerHTML = '';

  ANIMAIS.forEach(animal => {
    const card = document.createElement('div');
    card.className = 'animal-card';
    card.dataset.id = animal.id;

    card.innerHTML = `
      <div class="animal-card-img">
        <img src="imagens/animais/${animal.id}.jpg" alt="${animal.nome}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="animal-emoji-fb" style="display:none">${animal.emoji}</div>
      </div>
      <span class="animal-nome">${animal.nome}</span>
      <span class="animal-onde">${animal.onde}</span>
    `;

    card.addEventListener('click', () => selecionarAnimal(animal, card));
    grid.appendChild(card);
  });

  // Selecionar o primeiro por defeito
  if (ANIMAIS.length > 0) {
    const primeiroCard = grid.querySelector('.animal-card');
    if (primeiroCard) selecionarAnimal(ANIMAIS[0], primeiroCard);
  }
}

function selecionarAnimal(animal, cardEl) {
  animalSelecionado = animal;

  // Atualizar visual do grid
  document.querySelectorAll('.animal-card').forEach(c => c.classList.remove('selecionado'));
  cardEl.classList.add('selecionado');

  // Atualizar preview
  const preview = document.getElementById('criador-preview-img');
  const previewEmoji = document.getElementById('criador-preview-emoji');
  const previewNome = document.getElementById('criador-preview-nome');
  const previewOnde = document.getElementById('criador-preview-onde');

  if (preview) {
    preview.src = `imagens/animais/${animal.id}.jpg`;
    preview.style.display = 'block';
    preview.onerror = () => {
      preview.style.display = 'none';
      if (previewEmoji) previewEmoji.style.display = 'flex';
    };
  }
  if (previewEmoji) {
    previewEmoji.textContent = animal.emoji;
    previewEmoji.style.display = 'none';
  }
  if (previewNome) previewNome.textContent = animal.nome;
  if (previewOnde) previewOnde.textContent = `📍 ${animal.onde}`;
}

// =====================================================================
// BOTÃO CONFIRMAR CRIADOR
// =====================================================================
document.getElementById('btn-confirmar-criador').addEventListener('click', () => {
  const nick = document.getElementById('input-nickname').value.trim();
  const idade = parseInt(document.getElementById('input-idade').value, 10) || 8;

  if (!nick) {
    const inp = document.getElementById('input-nickname');
    inp.focus();
    inp.style.borderColor = '#E74C3C';
    setTimeout(() => (inp.style.borderColor = ''), 1500);
    return;
  }
  if (!animalSelecionado) {
    alert('Escolhe primeiro um animal!');
    return;
  }

  const perfil = criarPerfilVazio(nick, idade);
  perfil.avatar = { animal: animalSelecionado.id };
  G.perfis.push(perfil);
  G.perfilAtivo = G.perfis.length - 1;
  guardarEstado();
  mostrarBoasVindas(nick);
});

function mostrarBoasVindas(nick) {
  const animal = ANIMAIS.find(a => a.id === animalSelecionado?.id) || { emoji: '🐾', nome: 'amigo' };
  document.getElementById('texto-boas-vindas').textContent =
    `Olá, ${nick}! O teu animal é ${animal.emoji} ${animal.nome} de ${animal.onde || 'todo o lado'}! Neste jogo vais aprender curiosidades sobre o mundo inteiro. Espero que te divirtas muito!`;
  mostrarEcra('ecra-boas-vindas');
}

document.getElementById('btn-comecar').addEventListener('click', () => {
  irParaMapa();
});

// =====================================================================
// INJETAR MASCOTE BEATRIZ NO QUIZ
// =====================================================================
(function() {
  const el = document.getElementById('quiz-beatriz');
  if (el) el.innerHTML = beatrizImgHTML(75, 100);
})();
