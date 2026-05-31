# Planeta — Caderno de Especificações

**Versão:** 1.0 (rascunho de arranque)
**Data:** maio de 2026
**Autores:** [o teu nome] e Beatriz
**Estado:** aprovado para desenvolvimento da primeira fatia jogável

---

## 1. Visão geral

**Planeta** é um jogo educativo para crianças (≈ 8 anos, 3.º ano de escolaridade em Portugal) que ensina curiosidades sobre o mundo enquanto se joga. Combina perguntas de escolha múltipla com mini-jogos práticos, intercalados, para que a criança aprenda *a fazer* e não só *a responder*.

O conteúdo segue de perto o programa de **Estudo do Meio do 3.º ano**, alargado com curiosidades gerais sobre o mundo (países, oceanos, espaço, animais, ambiente).

### Objetivos do projeto
- **Pedagógico:** aprender a brincar; reforçar conhecimento de Estudo do Meio e cultura geral.
- **Pessoal:** a Beatriz perceber, na prática, o que se consegue construir com o Claude.
- **Concreto:** produzir uma aplicação Android (APK) instalável, levável à escola para mostrar à professora e aos amigos.

### Público-alvo
Crianças dos 7 aos 10 anos. Interface desenhada para dedos pequenos: botões grandes, texto claro, poucas opções por ecrã, leitura em voz alta opcional.

---

## 2. Plataforma e arquitetura técnica

### Estratégia
O jogo é construído como **aplicação web** (HTML + CSS + JavaScript), pensada desde o início para:
- funcionar bem em ecrã de telemóvel/tablet (orientação retrato, toque);
- funcionar **offline** (essencial para a sala de aula sem internet);
- ser depois **empacotada em APK** para instalar no Android.

### Porquê este caminho
A geração direta de um ficheiro APK exige a cadeia de ferramentas Android (Android Studio / Gradle), que tem de correr na tua máquina. O caminho realista é: construir e validar o jogo como web app e, no fim, "embrulhá-lo" em APK com uma ferramenta de empacotamento. A lógica do jogo fica 100 % reaproveitada.

### Componentes técnicos previstos
| Camada | Tecnologia proposta | Notas |
|---|---|---|
| Interface e lógica | HTML5, CSS3, JavaScript (sem framework pesado) | Simples de manter e de escalar |
| Dados do jogo (perguntas, temas, mini-jogos) | Ficheiros **JSON** | Editáveis sem mexer no código |
| Progresso e perfis | `localStorage` / `IndexedDB` do aparelho | Guarda offline; vários jogadores |
| Narração (texto → voz) | Web Speech API (voz do aparelho, pt-PT) | Depende da voz instalada no aparelho |
| Som e música | Ficheiros de áudio + Web Audio API | Botão de silêncio sempre visível |
| Empacotamento APK | **Capacitor** (recomendado) ou PWABuilder | Passo final, na tua máquina |

> **Nota técnica importante:** o progresso é guardado com `localStorage`/`IndexedDB`. Estas funcionalidades funcionam na app real (web app autónoma e APK), mas **não** dentro de uma pré-visualização gerada no claude.ai. Por isso, eventuais protótipos mostrados aqui no chat usarão memória temporária; a persistência real ativa-se quando o projeto passa para o teu computador.

---

## 3. Estrutura do jogo

### Mundos (temas)
Cada **tema** é um *mundo* representado por um pino sobre o mapa-múndi (ver secção 4). Exemplos: Itália, Oceanos, Egito, Sistema Solar, Reciclagem, etc.

### Anatomia de um mundo (nível)
Sequência fixa, curta o suficiente para uma criança completar de uma sentada:

```
Entrar no mundo
   → 3 perguntas de escolha múltipla
   → 1 mini-jogo prático
   → 3 perguntas de escolha múltipla
   → Conclusão: medalha do mundo + moedas bónus
```

Cadência global aprovada: **3 perguntas : 1 mini-jogo**.

### Depois de cada resposta
Aparece sempre uma **curiosidade** ("Sabias que…?"), tenha a criança acertado ou não. Reforça a aprendizagem e justifica o nome do jogo.

### Quando a criança não sabe
1. Botão **"Pedir ajuda à Beatriz"** (a mascote).
2. A Beatriz dá **até 2 dicas**.
3. Se ainda assim errar, surge a mensagem de encorajamento:
   > *"Não há mal em errar! É a errar que nós aprendemos!"*
4. Errar **nunca** retira moedas nem penaliza — é um jogo para crianças.

---

## 4. Ecrã principal — o Planeta

O menu principal **é o planeta**: uma imagem de satélite da Terra (atrás do logótipo "Planeta", conforme conceito original).

- Cada mundo é um **pino sobre o local real** no mapa: Itália sobre Itália, Egito sobre o Egito, os Oceanos no meio do Atlântico (onde estão as ilhas de lixo), etc.
- Tocar num pino entra nesse mundo.
- Pinos de mundos ainda bloqueados aparecem a cinzento / com cadeado.
- Mundos concluídos mostram a **medalha** já ganha.
- Ensina geografia de forma implícita: a criança localiza os temas no mundo real.

Elementos sempre visíveis no menu: avatar do jogador (canto), total de moedas, botão de som, acesso ao guarda-roupa/loja e à troca de perfil.

---

## 5. Criação de personagem (avatar)

No primeiro arranque (e ao criar novo perfil), a criança cria a sua personagem.

### Dados
- **Nickname** (nome de jogador)
- **Idade**
- **Sexo**

### Aparência (montada por camadas)
- Corpo / tom de pele
- Cara
- Cabelo (estilo e cor)
- Olhos (cor)
- Roupa (conjuntos simples)
- **Acessórios:** óculos, brincos, pulseiras, etc.

> **Arquitetura do avatar:** o boneco é desenhado em **camadas independentes** (corpo, cara, cabelo, olhos, roupa, acessórios). Isto torna trivial recolorir peças e desbloquear/adicionar peças novas, e permite escalar o guarda-roupa indefinidamente.

### Mensagem de boas-vindas
Concluída a criação, aparece um balão de fala:
> *"Neste jogo irás aprender quase todas as curiosidades sobre o mundo! Espero que te divirtas!"*

---

## 6. A mascote — Beatriz

A mascote chama-se **Beatriz** e é o rosto/guia do jogo.

- **Aparência:** cabelo castanho comprido; olhos castanhos esverdeados.
- **Funções:**
  - Dá as boas-vindas.
  - Surge quando a criança pede ajuda e dá **até 2 dicas**.
  - Apresenta a mensagem de encorajamento depois de erros.
  - Pode comentar conquistas (medalhas, desbloqueios).

---

## 7. Economia de recompensas

Motor que liga o jogo ao avatar: jogar dá moedas → moedas compram peças novas para a personagem.

### Como se ganham moedas (valores afináveis)
| Ação | Recompensa |
|---|---|
| Resposta certa | +10 moedas |
| Resposta certa à 1.ª tentativa | +5 moedas de bónus |
| Mini-jogo concluído | +20 moedas |
| Mundo completo | +50 moedas + medalha |

### Regras
- **Errar nunca retira moedas.**
- As **dicas da Beatriz são gratuitas**.
- As moedas gastam-se no **guarda-roupa/loja** para desbloquear roupa e acessórios novos do avatar.
- As **medalhas** ficam visíveis no menu (pino do mundo) e no perfil.

---

## 8. Sistema de perguntas

### Formato
Escolha múltipla, com **uma resposta certa** e 2–3 distratores. Texto simples e curto, adequado a 8 anos.

### Estrutura de dados (editável)
As perguntas vivem em ficheiros **JSON** organizados por tema, para que tu e a Beatriz possam acrescentar/editar perguntas **sem tocar no código**. Estrutura proposta para cada pergunta:

```json
{
  "id": "italia_001",
  "pergunta": "Qual é a capital de Itália?",
  "opcoes": ["Roma", "Milão", "Veneza", "Nápoles"],
  "resposta_correta": 0,
  "dicas": [
    "É uma cidade muito antiga, com um coliseu gigante.",
    "Começa pela letra R."
  ],
  "curiosidade": "Sabias que em Roma há uma fonte (Fontana di Trevi) onde as pessoas atiram moedas e pedem um desejo?"
}
```

> Este formato garante que cada pergunta traz consigo as suas dicas e a sua curiosidade — tudo num só sítio, fácil de rever.

---

## 9. Mini-jogos

Todos os mini-jogos listados **avançam** (aprovados na íntegra). Cada um liga-se a um tema. São de tipos variados (montar, separar, ordenar, conduzir) para manter a novidade.

| Mini-jogo | Tema | Tipo de interação |
|---|---|---|
| Montar uma pizza | Itália | Arrastar ingredientes |
| Construir a pirâmide | Egito | Empilhar/encaixar peças |
| Limpar as ilhas de lixo | Oceanos / Atlântico | Apanhar/recolher |
| Fazer o que os gatos pedem | Curiosidades sobre gatos | Sequência de ações |
| Ordenar os planetas | Sistema Solar | Arrastar pela ordem certa |
| Separar o lixo | Reciclagem | Classificar nos contentores |
| Montar o ciclo da água | Ciência/Natureza | Ordenar etapas |
| Colocar os órgãos | Corpo humano | Posicionar no sítio certo |
| Montar um prato saudável | Alimentação (Portugal) | Compor a roda dos alimentos |
| Animal → habitat / som | Animais | Associar pares |
| Construir a Torre Eiffel | França | Encaixar peças |
| Apanhar o sushi / origami | Japão | Apanhar/dobrar |
| Foguetão até à Lua | Espaço | Desviar de obstáculos |
| Vestir conforme o tempo | Estações/Meteorologia | Escolher roupa certa |
| Bússola até ao destino | Pontos cardeais | Orientação |

> A arquitetura prevê os mini-jogos como **módulos independentes**: cada um é uma "peça" que se encaixa no fluxo do mundo. Acrescentar um mini-jogo novo não obriga a mexer nos existentes.

---

## 10. Os três temas iniciais (primeira fatia)

Para a primeira versão a mostrar à professora, construímos uma **fatia completa e polida** com 3 mundos de tipos de mini-jogo diferentes, mais o criador de personagem e o avatar funcional.

### 10.1 Itália — *Montar a Pizza*
- 6 perguntas (geografia, monumentos, comida, curiosidades).
- Mini-jogo: arrastar os ingredientes certos para a massa.

### 10.2 Oceanos — *Limpar as Ilhas de Lixo*
- 6 perguntas (oceanos, vida marinha, ambiente, as duas ilhas de lixo do Atlântico).
- Mini-jogo: recolher o lixo que polui o oceano.

### 10.3 Egito — *Construir a Pirâmide*
- 6 perguntas (Egito antigo, faraós, rio Nilo, pirâmides).
- Mini-jogo: empilhar os blocos para erguer a pirâmide.

> A estrutura (mundos + JSON + módulos de mini-jogo) fica preparada para acrescentar **todos os outros temas** depois, sem refazer o que já existe.

---

## 11. Som e narração
- **Música de fundo** suave, em ciclo.
- **Efeitos sonoros:** acerto, ganhar moeda, desbloqueio, conclusão de mundo.
- **Botão de silêncio** sempre visível e fácil de tocar.
- **Narração (texto → voz):** lê a pergunta em voz alta em português, usando a voz do aparelho.
  - *Ressalva honesta:* depende de o aparelho ter voz portuguesa instalada. Se não tiver, o texto continua presente — apenas não há leitura em voz alta.

---

## 12. Estilo visual e interface
- Ilustração **colorida**, formas redondas e amigáveis.
- **Botões grandes**, pensados para dedos de criança.
- Poucas escolhas por ecrã; navegação simples e previsível.
- Orientação **retrato** (telemóvel).
- Contraste e tamanho de letra adequados a quem está a aprender a ler.

---

## 13. Progresso e múltiplos jogadores
- O jogo guarda **localmente no aparelho:** avatar, moedas, peças desbloqueadas, medalhas e progresso por mundo.
- Suporta **vários perfis** — a Beatriz e os amigos têm cada um o seu.
- Funciona **offline** (sala de aula).
- Ecrã inicial permite **escolher/criar perfil**.

---

## 14. Roadmap

| Fase | Conteúdo | Objetivo |
|---|---|---|
| **0 — Validação** | Este caderno + protótipo de conceito | Confirmar a visão (estamos aqui) |
| **1 — Fatia jogável** | Criador de personagem + avatar + 3 mundos (Itália, Oceanos, Egito) + economia + mascote + som | Versão mostrável à professora |
| **2 — Empacotamento** | Web app → APK (Capacitor) | Instalar no telemóvel; levar à escola |
| **3 — Expansão** | Restantes mundos e mini-jogos; guarda-roupa alargado | Crescer o conteúdo |
| **4 — Polimento** | Narração, animações, mais curiosidades, afinação de valores | Acabamento |

---

## 15. Como e quando passar para o Visual Studio Code

Esta secção responde à pergunta direta: **quando** e **como** sais do chat e começas a trabalhar no teu computador.

### Quando
**No fim da Fase 1.** Ou seja: primeiro construímos e validamos aqui a fatia jogável (os ficheiros do jogo). Só quando tivermos um conjunto de ficheiros que funciona é que passas para o VS Code. Não vale a pena instalar ferramentas antes de haver algo para correr.

### Como (passo a passo, quando chegar a altura)
1. **Instalar o Visual Studio Code** (gratuito, do site oficial da Microsoft).
2. **Instalar o Node.js** (versão LTS) — necessário para o empacotamento em APK na Fase 2.
3. **Criar uma pasta** para o projeto, por exemplo `Planeta/`.
4. **Colocar lá os ficheiros** que eu te entregar. A estrutura será mais ou menos:
   ```
   Planeta/
     index.html
     /css
     /js
     /dados        (os JSON com perguntas e temas)
     /imagens      (avatar em camadas, mapas, ícones)
     /sons
   ```
5. **Abrir a pasta no VS Code** e instalar a extensão **Live Server** — permite abrir o jogo no browser com um clique e ver as alterações em tempo real.
6. **Editar conteúdo** (perguntas, curiosidades) diretamente nos ficheiros JSON da pasta `/dados`.
7. **Fase 2 — APK:** com o Node.js instalado, seguimos o procedimento do **Capacitor** para gerar o APK. Dou-te os comandos exatos quando lá chegarmos.

> Com o teu perfil (engenharia de automação, bases de programação, experiência em CODESYS e ladder), este fluxo vai ser-te familiar: editar ficheiros, correr um servidor local, testar, iterar.

---

## 16. Questões em aberto (para fases seguintes)
- Lista final e número total de mundos.
- Banco de perguntas completo por tema (volume a definir).
- Conjunto inicial de peças de guarda-roupa e respetivos preços em moedas.
- Eventual ecrã de "conquistas"/coleção de medalhas.
- Idiomas (por agora, apenas português de Portugal).

---

*Fim do caderno de especificações — versão 1.0.*
