/**
 * ASTROROTA – 1º EM (p5.js)
 * Fases: MU, Função/Gráfico, Vetores, Energia
 * 100% navegador. Ideal para GitHub Pages.
 */

let W = 960, H = 540;
let state = "menu"; // menu, phase1..phase4, results
let phase = 1;

let score = 0;
let lives = 3;
let timer = 0; // em segundos (simulado)
let phaseStartTime = 0;
let msg = "";
let msgTimer = 0;

let stars = [];
let seed;

function setup() {
  createCanvas(W, H);
  textFont("system-ui");
  seed = floor(random(1e9));
  randomSeed(seed);

  for (let i = 0; i < 180; i++) {
    stars.push({ x: random(W), y: random(H), s: random(1, 3), a: random(80, 220) });
  }

  initPhase1();
}

function draw() {
  background(7, 11, 24);
  drawStars();

  if (state === "menu") drawMenu();
  else if (state === "phase1") drawPhase1();
  else if (state === "phase2") drawPhase2();
  else if (state === "phase3") drawPhase3();
  else if (state === "phase4") drawPhase4();
  else if (state === "results") drawResults();

  drawHUD();
  drawToast();
}

function drawStars() {
  noStroke();
  for (const st of stars) {
    fill(220, 235, 255, st.a);
    circle(st.x, st.y, st.s);
    st.x -= 0.15 * st.s;
    if (st.x < -10) { st.x = W + 10; st.y = random(H); }
  }
}

function drawHUD() {
  // topo
  noStroke();
  fill(10, 18, 40, 220);
  rect(0, 0, W, 52);

  fill(235);
  textSize(14);
  textAlign(LEFT, CENTER);

  const t = (state === "menu" || state === "results") ? 0 : max(0, (millis() - phaseStartTime) / 1000);
  text(`FASE: ${state.startsWith("phase") ? phase : "-"}  |  PONTOS: ${score}  |  VIDAS: ${"❤".repeat(lives)}`, 16, 26);

  textAlign(RIGHT, CENTER);
  text(`Seed: ${seed}`, W - 16, 26);
}

function toast(t, seconds = 2.0) {
  msg = t;
  msgTimer = seconds;
}

function drawToast() {
  if (msgTimer <= 0) return;
  msgTimer -= deltaTime / 1000;

  const pad = 14;
  textSize(14);
  textAlign(CENTER, CENTER);
  const tw = textWidth(msg) + pad * 2;

  fill(0, 0, 0, 140);
  rectMode(CENTER);
  rect(W / 2, H - 46, tw, 34, 10);
  fill(240);
  text(msg, W / 2, H - 46);
  rectMode(CORNER);
}

/* -------------------------
   UI helpers (botões)
-------------------------- */
function drawButton(x, y, w, h, label) {
  const hover = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
  fill(hover ? color(60, 120, 255) : color(35, 70, 190));
  noStroke();
  rect(x, y, w, h, 12);
  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
  return hover;
}

function clickedButton(x, y, w, h) {
  return mouseIsPressed && mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

/* -------------------------
   MENU
-------------------------- */
function drawMenu() {
  phase = 1;
  fill(240);
  textAlign(CENTER, TOP);
  textSize(34);
  text("ASTROROTA – 1º EM", W / 2, 90);

  textSize(16);
  fill(200);
  text("Jogo interdisciplinar (Física + Matemática)\nVocê vence aplicando MU, função afim, vetores e energia.", W / 2, 150);

  // painel
  fill(10, 18, 40, 200);
  rect(W / 2 - 290, 220, 580, 210, 18);

  fill(230);
  textSize(15);
  text("Como jogar:\n• Cada fase tem uma missão e uma ideia-chave.\n• Ajuste parâmetros (setas/teclas) e confirme.\n• Erros custam vida. Acertos dão pontos e power-ups.\n\nDica: leia o objetivo no canto inferior.", W / 2, 245);

  const bx = W / 2 - 130, by = 455, bw = 260, bh = 52;
  drawButton(bx, by, bw, bh, "INICIAR");
  if (clickedButton(bx, by, bw, bh)) startGame();
}

function startGame() {
  score = 0;
  lives = 3;
  initPhase1();
  state = "phase1";
  phaseStartTime = millis();
  toast("Fase 1: ajuste a velocidade para acoplar no tempo certo!");
}

/* -------------------------
   FASE 1 — Docking MU
   Objetivo: escolher v para chegar no alvo em T
   s(t)=s0 + v*t
-------------------------- */
let p1 = {};
function initPhase1() {
  phase = 1;
  p1 = {
    shipX: 120,
    shipY: H / 2,
    s0: 0,
    tTarget: floor(random(8, 13)), // 8..12 s
    dist: floor(random(360, 520)), // distância até a doca
    v: 30, // px/s (ajustável)
    running: false,
    t: 0,
    reached: false
  };
  // converter dist para "metros" (didático): 1px = 1m aqui
}

function drawPhase1() {
  // cenário
  drawStation(p1.shipX + p1.dist, p1.shipY);

  // nave
  drawShip(p1.shipX, p1.shipY);

  // instruções e UI
  fill(10, 18, 40, 200);
  rect(20, H - 140, W - 40, 110, 16);
  fill(235);
  textAlign(LEFT, TOP);
  textSize(14);

  // --- TEXTO NOVO (Missão 1 mais clara) ---
const title = `MISSÃO 1 — ACOPLAMENTO CONTROLADO (Movimento Uniforme)`;

const objective =
  `🎯 OBJETIVO: escolher uma velocidade para que a nave chegue na DOCA ` +
  `exatamente quando o tempo T terminar.`;

const data =
  `📌 DADOS:\n` +
  `• Tempo do sistema: T = ${p1.tTarget} s\n` +
  `• Distância até a doca: ${p1.dist} m  (1 px = 1 m)\n` +
  `• Posição inicial: s0 = 0 m\n`;

const howTo =
  `🎮 COMO FAZER:\n` +
  `1) Use ← → para ajustar a velocidade v\n` +
  `2) Clique em "TESTAR v"\n` +
  `3) Quando o tempo acabar, veja se a nave parou na linha da doca\n` +
  `4) Se errar, ajuste v e teste de novo\n`;

const success =
  `✅ VOCÊ VENCE SE: ao final do tempo, a nave parar bem perto da linha da doca.`;

const hint =
  `💡 DICA: no MU, s = v·t (aqui s0 = 0). Então uma boa estimativa é v ≈ distância / T.`;

// desenhar em linhas (mais legível)
textAlign(LEFT, TOP);
textSize(14);
fill(235);

let xText = 40;
let yText = H - 128;

text(title, xText, yText); yText += 20;
fill(210);
text(objective, xText, yText); yText += 22;

fill(235);
text(data, xText, yText); yText += 56;

text(howTo, xText, yText); yText += 74;

fill(220);
text(success, xText, yText); yText += 22;

fill(180);
text(hint, xText, yText);
// --- FIM DO TEXTO NOVO ---
;

  // slider simples (teclas)
  fill(220);
 text(`Controle: ajuste v = ${p1.v.toFixed(0)} m/s com ← →`, 40, H - 64);


  // botões
  const bx = W - 260, by = H - 105, bw = 220, bh = 44;
  drawButton(bx, by, bw, bh, p1.running ? "SIMULANDO..." : "TESTAR v");
  if (!p1.running && clickedButton(bx, by, bw, bh)) {
    p1.running = true;
    p1.t = 0;
    toast("Simulação iniciada!");
  }

  // simulação
  if (p1.running) {
    const dt = deltaTime / 1000;
    p1.t += dt;
    p1.shipX = 120 + p1.v * p1.t;

    // visual de tempo
    fill(255);
    textAlign(RIGHT, TOP);
    textSize(16);
    text(`t = ${p1.t.toFixed(2)}s`, W - 20, 70);

    if (p1.t >= p1.tTarget) {
      p1.running = false;

      // checar erro (tolerância de ±12 px)
      const targetX = 120 + p1.dist;
      const err = abs(p1.shipX - targetX);

      if (err <= 12) {
        score += 150;
        toast(`Acoplamento perfeito! (+150) Erro: ${err.toFixed(1)}m`);
        nextPhase(2);
      } else {
        lives -= 1;
        toast(`Falhou. Ajuste v. Erro: ${err.toFixed(1)}m  (-1 vida)`);
        // reset posição
        p1.shipX = 120;
        if (lives <= 0) endGame();
      }
    }
  }
}

function drawStation(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(160, 190, 255, 170);
  rect(-14, -70, 28, 140, 6);
  fill(255, 180);
  rect(-30, -20, 60, 40, 10);
  fill(40, 70, 170);
  circle(0, 0, 22);
  pop();

  // linha de referência
  stroke(120, 160, 255, 90);
  line(x, 0, x, H);
}

function drawShip(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(0, 210, 255);
  ellipse(0, 0, 26, 18);
  fill(255, 90);
  triangle(-14, 0, -30, -10, -30, 10);
  fill(255, 170);
  circle(8, 0, 6);
  pop();
}

/* -------------------------
   FASE 2 — Gráfico → Motor
   Objetivo: deduzir v e s0 de um "gráfico" (pontos)
-------------------------- */
let p2 = {};
function initPhase2() {
  phase = 2;
  const v = floor(random(3, 9));      // m/s
  const s0 = floor(random(5, 31));    // m
  const t1 = 2, t2 = 6;

  p2 = {
    vTrue: v,
    s0True: s0,
    // pontos do gráfico (t, s)
    pA: { t: t1, s: s0 + v * t1 },
    pB: { t: t2, s: s0 + v * t2 },
    // input do jogador
    vGuess: 5,
    s0Guess: 10,
    submitted: false
  };
}

function drawPhase2() {
  // painel do gráfico
  fill(10, 18, 40, 220);
  rect(30, 80, 520, 360, 18);

  drawGraph(60, 110, 460, 300, p2.pA, p2.pB);

  // painel de controles
  fill(10, 18, 40, 220);
  rect(580, 80, 350, 360, 18);

  fill(235);
  textAlign(LEFT, TOP);
  textSize(14);
  text("MISSÃO 2 (Função afim):\nO gráfico abaixo mostra s(t).\nUse os DOIS pontos para descobrir:\n• v (coef. angular)\n• s0 (posição inicial)\n\nAjuste v e s0 e confirme.", 600, 102);

  // controles (teclas)
  textSize(14);
  text(`v = ${p2.vGuess} m/s  (W/S)`, 600, 240);
  text(`s0 = ${p2.s0Guess} m  (A/D)`, 600, 270);

  const bx = 600, by = 320, bw = 300, bh = 48;
  drawButton(bx, by, bw, bh, "CONFIRMAR");
  if (clickedButton(bx, by, bw, bh)) {
    const ok = (p2.vGuess === p2.vTrue && p2.s0Guess === p2.s0True);
    if (ok) {
      score += 200;
      toast("Motor calibrado! (+200)");
      nextPhase(3);
    } else {
      lives -= 1;
      toast("Calibração falhou. Use os pontos: v = Δs/Δt. (-1 vida)");
      if (lives <= 0) endGame();
    }
  }

  // dica contextual
  fill(200);
  textSize(12);
  text("Dica: v = (sB - sA) / (tB - tA). Depois use s0 = sA - v·tA.", 600, 392);
}

function drawGraph(x, y, w, h, pA, pB) {
  // eixos
  stroke(160, 190, 255, 120);
  line(x, y + h, x + w, y + h);
  line(x, y, x, y + h);

  // escala simples
  const tMax = 10;
  const sMax = 100;

  // grade leve
  stroke(160, 190, 255, 30);
  for (let i = 1; i <= 10; i++) {
    const gx = x + (w * i) / 10;
    const gy = y + (h * i) / 10;
    line(gx, y, gx, y + h);
    line(x, gy, x + w, gy);
  }

  // pontos
  const Ax = x + (pA.t / tMax) * w;
  const Ay = y + h - (pA.s / sMax) * h;
  const Bx = x + (pB.t / tMax) * w;
  const By = y + h - (pB.s / sMax) * h;

  // reta entre pontos
  stroke(0, 210, 255, 200);
  strokeWeight(3);
  line(Ax, Ay, Bx, By);
  strokeWeight(1);

  noStroke();
  fill(255);
  circle(Ax, Ay, 10);
  circle(Bx, By, 10);

  fill(220);
  textAlign(LEFT, CENTER);
  textSize(12);
  text(`A(${pA.t}, ${pA.s})`, Ax + 8, Ay);
  text(`B(${pB.t}, ${pB.s})`, Bx + 8, By);

  // labels
  fill(190);
  textAlign(LEFT, TOP);
  text("s (m)", x + 6, y - 16);
  textAlign(RIGHT, TOP);
  text("t (s)", x + w, y + h + 8);
}

/* -------------------------
   FASE 3 — Rota Vetorial (vetores simples)
   Objetivo: usar empuxos para atravessar corredor sem bater
-------------------------- */
let p3 = {};
function initPhase3() {
  phase = 3;
  p3 = {
    ship: { x: 120, y: H / 2, vx: 0, vy: 0 },
    gates: [],
    gateIndex: 0,
    // empuxos discretos
    thrust: 0.35,
    done: false
  };

  // gerar 5 portais
  let x = 260;
  for (let i = 0; i < 5; i++) {
    const cy = random(140, H - 140);
    p3.gates.push({ x, y: cy, r: 46 });
    x += 140;
  }
}

function drawPhase3() {
  fill(235);
  textAlign(LEFT, TOP);
  textSize(14);
  text("MISSÃO 3 (Vetores): atravesse os 5 portais.\nUse setas ↑ ↓ ← → para somar empuxos (vetores).\nDica: empuxos pequenos e consistentes = controle.", 30, 74);

  // desenhar portais
  for (let i = 0; i < p3.gates.length; i++) {
    const g = p3.gates[i];
    noFill();
    stroke(i === p3.gateIndex ? color(0, 255, 140) : color(160, 190, 255, 90));
    strokeWeight(i === p3.gateIndex ? 5 : 2);
    circle(g.x, g.y, g.r * 2);
  }
  strokeWeight(1);

  // física simples (integração)
  const dt = deltaTime / 16.666; // ~1 em 60fps
  p3.ship.x += p3.ship.vx * dt;
  p3.ship.y += p3.ship.vy * dt;

  // atrito leve (para não ficar infinito)
  p3.ship.vx *= 0.985;
  p3.ship.vy *= 0.985;

  // bordas
  if (p3.ship.y < 60 || p3.ship.y > H - 20 || p3.ship.x < 20) {
    crash("Bateu na borda! Vetores sem controle.");
    return;
  }

  // desenhar nave + vetor velocidade
  drawShip(p3.ship.x, p3.ship.y);
  stroke(255, 180);
  line(p3.ship.x, p3.ship.y, p3.ship.x + p3.ship.vx * 25, p3.ship.y + p3.ship.vy * 25);
  noStroke();
  fill(200);
  textAlign(LEFT, CENTER);
  text(`v⃗ = (${p3.ship.vx.toFixed(2)}, ${p3.ship.vy.toFixed(2)})`, 30, H - 28);

  // checar portal atual
  const g = p3.gates[p3.gateIndex];
  const d = dist(p3.ship.x, p3.ship.y, g.x, g.y);
  if (d <= g.r) {
    p3.gateIndex++;
    score += 60;
    toast("Portal atravessado! (+60)", 1.3);
    if (p3.gateIndex >= p3.gates.length) {
      score += 120;
      toast("Rota vetorial concluída! (+120)");
      nextPhase(4);
    }
  }

  // “asteroides” decorativos
  drawAsteroids();
}

function drawAsteroids() {
  noStroke();
  fill(160, 190, 255, 25);
  for (let i = 0; i < 12; i++) {
    const ax = 220 + i * 60;
    const ay = 70 + (i * 97) % (H - 140);
    circle(ax, ay, 14);
  }
}

function crash(reason) {
  lives -= 1;
  toast(`${reason} (-1 vida)`);
  if (lives <= 0) { endGame(); return; }
  // reset fase
  initPhase3();
}

/* -------------------------
   FASE 4 — Energia de Pouso
   Objetivo: escolher v para não exceder energia de impacto
   Em = Ep + Ec
-------------------------- */
let p4 = {};
function initPhase4() {
  phase = 4;
  // valores didáticos
  const m = random([1, 2, 3]); // kg
  const g = 10;               // m/s² (aprox)
  const h = random([8, 10, 12, 15]); // m
  const Em = (m * g * h) + random([40, 60, 80]); // energia mecânica total

  p4 = {
    m, g, h, Em: floor(Em),
    vGuess: 8,
    // limite de impacto (se Ec maior que isso, "quebra")
    EcMax: random([120, 140, 160]),
  };
}

function drawPhase4() {
  fill(235);
  textAlign(LEFT, TOP);
  textSize(14);

  text(
`MISSÃO 4 (Energia): escolha uma velocidade segura para pousar.
Dados:
m = ${p4.m} kg   g = ${p4.g} m/s²   h = ${p4.h} m
Energia mecânica total (Em) = ${p4.Em} J

No ponto de pouso, a energia potencial vira ~0, então:
Em ≈ Ec  e  Ec = (1/2)·m·v²

Regra do módulo: se Ec > ${p4.EcMax} J, o trem de pouso quebra.`,
  30, 74);

  // visual: “poço” e nave caindo (estético)
  drawLandingScene();

  // ajuste de v
  fill(10, 18, 40, 220);
  rect(30, H - 145, W - 60, 115, 16);
  fill(235);
  textAlign(LEFT, TOP);
  textSize(14);
  text(`Ajuste v (m/s): ${p4.vGuess}   (use ← →)`, 50, H - 125);

  // calcular Ec
  const Ec = 0.5 * p4.m * p4.vGuess * p4.vGuess;
  fill(200);
  text(`Ec(v) = 1/2·m·v² = ${Ec.toFixed(1)} J`, 50, H - 95);
  text(`Objetivo: escolher v tal que Ec ≈ Em, mas sem ultrapassar o limite de impacto.`, 50, H - 70);

  const bx = W - 260, by = H - 110, bw = 220, bh = 48;
  drawButton(bx, by, bw, bh, "VALIDAR POUSO");
  if (clickedButton(bx, by, bw, bh)) {
    // condição de vitória didática:
    // 1) Ec não pode passar do limite
    // 2) Ec deve ficar perto de Em (±12%)
    const okImpact = Ec <= p4.EcMax;
    const okMatch = abs(Ec - p4.Em) <= 0.12 * p4.Em;

    if (okImpact && okMatch) {
      score += 300;
      toast("Pouso perfeito! (+300)");
      state = "results";
    } else {
      lives -= 1;
      if (!okImpact) toast("Quebrou: energia de impacto alta demais. (-1 vida)");
      else toast("Inconsistente: Ec não bate com Em. (-1 vida)");
      if (lives <= 0) endGame();
    }
  }
}

function drawLandingScene() {
  // chão
  noStroke();
  fill(30, 50, 120, 60);
  rect(0, 310, W, 6);
  fill(20, 30, 60, 200);
  rect(0, 316, W, H - 316);

  // “colina”
  fill(0, 210, 255, 30);
  beginShape();
  vertex(0, 316);
  for (let x = 0; x <= W; x += 40) {
    vertex(x, 316 + 20 * sin((x + frameCount) * 0.01));
  }
  vertex(W, H);
  vertex(0, H);
  endShape(CLOSE);

  // nave flutuando
  const yy = 250 + 14 * sin(frameCount * 0.04);
  drawShip(160, yy);
}

/* -------------------------
   RESULTADOS / FIM
-------------------------- */
function drawResults() {
  fill(240);
  textAlign(CENTER, TOP);
  textSize(34);
  text("MISSÃO CONCLUÍDA!", W / 2, 120);

  textSize(18);
  fill(200);
  text(`Pontuação final: ${score}\nVidas restantes: ${lives}\n\nVocê integrou MU, função afim, vetores e energia para vencer.`, W / 2, 190);

  const bx = W / 2 - 160, by = 360, bw = 320, bh = 54;
  drawButton(bx, by, bw, bh, "JOGAR DE NOVO");
  if (clickedButton(bx, by, bw, bh)) {
    // novo seed, novo jogo
    seed = floor(random(1e9));
    randomSeed(seed);
    startGame();
  }

  const bx2 = W / 2 - 160, by2 = 430, bw2 = 320, bh2 = 54;
  drawButton(bx2, by2, bw2, bh2, "VOLTAR AO MENU");
  if (clickedButton(bx2, by2, bw2, bh2)) state = "menu";
}

function endGame() {
  state = "results";
  toast("Fim de jogo. Tente de novo com outra estratégia.", 3.0);
}

/* -------------------------
   Troca de fase
-------------------------- */
function nextPhase(next) {
  if (next === 2) { initPhase2(); state = "phase2"; phaseStartTime = millis(); return; }
  if (next === 3) { initPhase3(); state = "phase3"; phaseStartTime = millis(); return; }
  if (next === 4) { initPhase4(); state = "phase4"; phaseStartTime = millis(); return; }
}

/* -------------------------
   Controles
-------------------------- */
function keyPressed() {
  if (state === "menu") return;

  if (state === "phase1") {
    if (keyCode === LEFT_ARROW) p1.v = max(10, p1.v - 2);
    if (keyCode === RIGHT_ARROW) p1.v = min(120, p1.v + 2);
  }

  if (state === "phase2") {
    // W/S ajusta v, A/D ajusta s0 (teclado WASD)
    if (key === 'w' || key === 'W') p2.vGuess = min(15, p2.vGuess + 1);
    if (key === 's' || key === 'S') p2.vGuess = max(1, p2.vGuess - 1);
    if (key === 'd' || key === 'D') p2.s0Guess = min(60, p2.s0Guess + 1);
    if (key === 'a' || key === 'A') p2.s0Guess = max(0, p2.s0Guess - 1);
  }

  if (state === "phase3") {
    // vetores: setas somam empuxos
    if (keyCode === UP_ARROW) p3.ship.vy -= p3.thrust;
    if (keyCode === DOWN_ARROW) p3.ship.vy += p3.thrust;
    if (keyCode === LEFT_ARROW) p3.ship.vx -= p3.thrust;
    if (keyCode === RIGHT_ARROW) p3.ship.vx += p3.thrust;
  }

  if (state === "phase4") {
    if (keyCode === LEFT_ARROW) p4.vGuess = max(1, p4.vGuess - 1);
    if (keyCode === RIGHT_ARROW) p4.vGuess = min(30, p4.vGuess + 1);
  }
}

