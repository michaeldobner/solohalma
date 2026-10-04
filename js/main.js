import { FIGURES, GOAL, DEFAULT_FIGURE, figureById, nextFigure } from './figures.js?v=2.0.1';
import { Game } from './game.js?v=2.0.1';
import { BoardView } from './view.js?v=2.0.1';
import { Sound, DEFAULT_STYLE } from './sound.js?v=2.0.1';
import { load, save, migrate } from './storage.js?v=2.0.1';
import { lang, t, translateDocument } from './i18n.js?v=2.0.1';
import { Tilt } from './tilt.js?v=2.0.1';

export const VERSION = '2.0.1';

const $ = (sel) => document.querySelector(sel);

migrate();
translateDocument();
$('#version').textContent = `SPRING · ${t('subtitle')} · ${t('version', { v: VERSION })}`;

// ---------- Zustand ----------

const sound = new Sound({ enabled: load('sound', true), style: load('soundStyle', DEFAULT_STYLE) });
let stats = load('stats', {});
const games = new Map();
let figure = figureById(load('figure', DEFAULT_FIGURE)) || figureById(DEFAULT_FIGURE);
let game = gameFor(figure);
let hintCache = null;

// Jede Figur hat ihren eigenen, gespeicherten Spielstand
function gameFor(fig) {
  if (!games.has(fig.id)) {
    const g = new Game(fig);
    const saved = load(`game:${fig.id}`, null);
    if (saved && g.restore(saved)) g.counted = Boolean(saved.counted);
    else g.counted = false;
    g.startCount = g.cells.filter((c) => c.start).length;
    games.set(fig.id, g);
  }
  return games.get(fig.id);
}

function persist(g = game) {
  save(`game:${g.board.id}`, { ...g.serialize(), counted: g.counted });
}

function statsFor(id) {
  return stats[id] || { games: 0, solved: 0, perfect: 0, best: null, stars: 0 };
}

const progress = () => game.history.length / Math.max(1, game.startCount - 1);

// ---------- Brett ----------

const view = new BoardView($('#board'), {
  move(record, phase) {
    if (phase === 'jump') {
      advanceHint(record);
      updateHud();
      persist();
    } else if (phase === 'land') {
      sound.land(progress());
    } else if (phase === 'gutter') {
      sound.gutter();
      checkEnd();
    }
  },
  invalid: () => sound.invalid(),
  lift: () => sound.lift(),
  clack: (i) => sound.clack(i),
  roll: (level) => sound.roll(level),
});
view.setGame(game);

const tilt = new Tilt((x, y) => view.setGravity(x, y));

// ---------- Anzeige ----------

function updateHud() {
  const n = game.count;
  $('#count').textContent = n;
  $('#count-label').textContent = t('marbles', { n });
  $('#undo').disabled = game.history.length === 0;
  $('#hint').disabled = game.isOver;
  $('#figure-label').textContent = figure.name[lang];
  document.title = `SPRING · ${figure.name[lang]}`;
  renderFigureList();
}

function checkEnd() {
  if (!game.isOver) return;
  const r = game.rating();
  if (!game.counted) {
    game.counted = true;
    const s = statsFor(figure.id);
    s.games += 1;
    if (r.left === 1) s.solved += 1;
    if (game.isPerfect) s.perfect += 1;
    if (s.best === null || r.left < s.best) s.best = r.left;
    s.stars = Math.max(s.stars, r.stars);
    stats = { ...stats, [figure.id]: s };
    save('stats', stats);
    persist();
  }
  if (r.left === 1) sound.win(game.isPerfect);
  showResult();
}

function showResult() {
  const r = game.rating();
  const s = statsFor(figure.id);
  const [title, text] = t(`rating.${r.key}`, { n: r.left });
  $('#result-title').textContent = title;
  $('#result-text').textContent = text;
  $('#result-stars').innerHTML = starsHtml(r.stars);
  const parts = [];
  if (s.best !== null) parts.push(t('best', { n: s.best }));
  if (s.solved > 0) parts.push(t('solved', { n: s.solved }));
  $('#result-stats').textContent = parts.join(' · ');
  const next = nextFigure(figure.id);
  $('#next').hidden = !next;
  $('#result').classList.toggle('perfect', game.isPerfect);
  $('#result').hidden = false;
  requestAnimationFrame(() => $('#result').classList.add('show'));
}

function hideResult() {
  $('#result').classList.remove('show');
  $('#result').hidden = true;
}

function starsHtml(n) {
  return [0, 1, 2].map((i) => `<span class="star${i < n ? ' on' : ''}">★</span>`).join('');
}

// ---------- Figuren ----------

function miniBoard(fig) {
  let dots = '';
  fig.layout.forEach((line, r) => {
    [...line].forEach((ch, c) => {
      if (ch === ' ') return;
      const cls = ch === 'o' ? ((r + c) % 2 === 0 ? 'b' : 'k') : 'e';
      dots += `<circle class="${cls}" cx="${c * 10 + 5}" cy="${r * 10 + 5}" r="${ch === 'o' ? 4 : 1.6}"/>`;
    });
  });
  return `<svg viewBox="-2 -2 74 74" aria-hidden="true"><circle class="plate" cx="35" cy="35" r="37"/>${dots}</svg>`;
}

function renderFigureList() {
  const list = $('#figure-list');
  list.innerHTML = FIGURES.map((fig) => {
    const s = statsFor(fig.id);
    const g = games.get(fig.id);
    const savedState = g || load(`game:${fig.id}`, null);
    const running = g ? g.history.length > 0 && !g.isOver : savedState && savedState.history && savedState.history.length > 0;
    const left = g ? g.count : savedState ? savedState.marbles.filter((m) => m !== null).length : 0;
    const dots = [1, 2, 3, 4, 5].map((i) => `<i class="${i <= fig.difficulty ? 'on' : ''}"></i>`).join('');
    const count = fig.layout.join('').split('o').length - 1;
    return `<li>
      <button class="figure-card${fig.id === figure.id ? ' current' : ''}" type="button" data-id="${fig.id}"
              aria-pressed="${fig.id === figure.id}">
        ${miniBoard(fig)}
        <span class="fc-name">${fig.name[lang]}</span>
        <span class="fc-meta">${count} ${t('marbles', { n: count })}</span>
        <span class="fc-stars" aria-label="${s.stars}/3">${starsHtml(s.stars)}</span>
        <span class="fc-dots" title="${t('difficulty', { n: fig.difficulty })}" aria-label="${t('difficulty', { n: fig.difficulty })}">${dots}</span>
        ${running ? `<span class="fc-badge">${t('inProgress', { n: left })}</span>` : ''}
      </button>
    </li>`;
  }).join('');
}

async function switchFigure(id) {
  const fig = figureById(id);
  if (!fig || fig.id === figure.id || view.busy) return;
  hideResult();
  figure = fig;
  game = gameFor(fig);
  hintCache = null;
  save('figure', fig.id);
  updateHud();
  await view.morph(game);
  sound.gutter();
  if (game.history.length > 0 && game.isOver) showResult();
}

// ---------- Panels ----------

const isSidebar = () => window.matchMedia('(min-width: 1000px) and (orientation: landscape) and (min-height: 600px)').matches;

function openPanel(name) {
  closePanels();
  if (name === 'figures' && isSidebar()) return;
  document.body.classList.add(`open-${name}`);
  $('#scrim').hidden = false;
  if (name === 'figures') {
    const current = $('#figure-list .current');
    if (current) current.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
}

function closePanels() {
  document.body.classList.remove('open-figures', 'open-settings');
  $('#scrim').hidden = true;
}

// Blatt mit dem Finger nach unten wegwischen
function swipeToClose(el) {
  let start = null;
  el.addEventListener('touchstart', (e) => {
    const inList = e.target.closest('.figure-list');
    start = inList ? null : e.touches[0].clientY;
  }, { passive: true });
  el.addEventListener('touchend', (e) => {
    if (start !== null && e.changedTouches[0].clientY - start > 60) closePanels();
    start = null;
  }, { passive: true });
}

// ---------- Tipps ----------

let worker = null;
let hintRequest = 0;

function occKey(g) {
  return g.marbles.map((m) => (m === null ? 0 : 1)).join('');
}

function advanceHint(record) {
  if (!hintCache) return;
  const [from, , to] = hintCache.moves[0] || [];
  if (record.from === from && record.to === to) {
    hintCache.moves.shift();
    hintCache.key = occKey(game);
  } else {
    hintCache = null;
  }
}

function askSolver() {
  if (!worker) worker = new Worker(new URL('./solver-worker.js?v=2.0.1', import.meta.url), { type: 'module' });
  const id = ++hintRequest;
  return new Promise((resolve) => {
    const onMessage = (e) => {
      if (e.data.id !== id) return;
      worker.removeEventListener('message', onMessage);
      resolve(e.data.result);
    };
    worker.addEventListener('message', onMessage);
    worker.postMessage({
      id,
      cells: game.cells.map(({ r, c }) => ({ r, c })),
      occupied: game.occupancy(),
      goal: game.cellAt(...GOAL),
      budget: 4000,
    });
  });
}

async function hint() {
  if (view.busy || game.isOver) return;
  const btn = $('#hint');
  let moves;
  if (hintCache && hintCache.figure === figure.id && hintCache.key === occKey(game) && hintCache.moves.length) {
    moves = hintCache.moves;
  } else {
    btn.classList.add('busy');
    const slow = setTimeout(() => toast(t('thinking')), 350);
    const forGame = game;
    const result = await askSolver();
    clearTimeout(slow);
    btn.classList.remove('busy');
    if (forGame !== game) return;
    if (result === 'timeout') return toast(t('hintTimeout'));
    if (!result) return toast(t('noSolution'));
    moves = result;
    hintCache = { figure: figure.id, key: occKey(game), moves: result.slice() };
  }
  hideToast();
  const [from, , to] = moves[0];
  view.showHint(from, to);
}

// ---------- Hinweise ----------

let toastTimer = null;
function toast(text, ms = 3200) {
  const el = $('#toast');
  el.textContent = text;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, ms);
}

function hideToast() {
  const el = $('#toast');
  el.classList.remove('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 250);
}

// Einmaliger Hinweis beim ersten Start. Verschwindet nach dem ersten Tipp oder nach 6 Sekunden.
function showCoach() {
  if (load('coachSeen', false) || isSidebar()) return;
  save('coachSeen', true);
  const el = $('#coach');
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(hideCoach, 6000);
  document.addEventListener('pointerdown', hideCoach, { once: true });
}

function hideCoach() {
  const el = $('#coach');
  if (el.hidden) return;
  el.classList.remove('show');
  setTimeout(() => (el.hidden = true), 300);
}

// ---------- Bedienung ----------

async function newGame() {
  hideResult();
  game.reset();
  game.counted = false;
  hintCache = null;
  persist();
  updateHud();
  await view.morph(game);
}

async function undo() {
  hideResult();
  const rec = await view.undo();
  if (!rec) return;
  hintCache = null;
  sound.land(progress(), { soft: true });
  updateHud();
  persist();
}

// Neustart braucht bei laufendem Spiel zwei Tipps
let confirmTimer = null;
function restart() {
  const btn = $('#restart');
  if (game.history.length === 0 || game.isOver || btn.classList.contains('confirm')) {
    clearTimeout(confirmTimer);
    btn.classList.remove('confirm');
    newGame();
    return;
  }
  btn.classList.add('confirm');
  confirmTimer = setTimeout(() => btn.classList.remove('confirm'), 2500);
}

// ---------- Einstellungen ----------

function renderSettings() {
  $('#sound-toggle').setAttribute('aria-checked', String(sound.enabled));
  document.querySelectorAll('#style-choice [data-style]').forEach((b) => {
    b.setAttribute('aria-checked', String(b.dataset.style === sound.style));
  });
  $('#tilt-toggle').setAttribute('aria-checked', String(tilt.enabled));
}

async function toggleTilt() {
  if (tilt.enabled) {
    tilt.disable();
    save('tilt', false);
  } else {
    const result = await tilt.enable();
    if (result === 'denied') toast(t('tiltDenied'));
    if (result === 'unsupported') toast(t('tiltUnsupported'));
    save('tilt', result === 'ok');
  }
  renderSettings();
}

// ---------- Ereignisse ----------

$('#undo').addEventListener('click', undo);
$('#hint').addEventListener('click', hint);
$('#restart').addEventListener('click', restart);
$('#again').addEventListener('click', newGame);
$('#back').addEventListener('click', undo);
$('#next').addEventListener('click', () => {
  const next = nextFigure(figure.id);
  if (next) switchFigure(next.id);
});

$('#figure-name').addEventListener('click', () => {
  hideCoach();
  if (document.body.classList.contains('open-figures')) closePanels();
  else openPanel('figures');
});
$('#figures').addEventListener('click', () => {
  hideCoach();
  openPanel('figures');
});
$('#settings-btn').addEventListener('click', () => {
  renderSettings();
  openPanel('settings');
});
$('#panel-close').addEventListener('click', closePanels);
$('#settings-close').addEventListener('click', closePanels);
$('#scrim').addEventListener('click', closePanels);
document.addEventListener('keydown', (e) => e.key === 'Escape' && closePanels());
swipeToClose($('#panel'));
swipeToClose($('#settings'));

$('#figure-list').addEventListener('click', (e) => {
  const card = e.target.closest('.figure-card');
  if (card) switchFigure(card.dataset.id);
});

$('#sound-toggle').addEventListener('click', () => {
  sound.enabled = !sound.enabled;
  if (!sound.enabled) sound.roll(0);
  save('sound', sound.enabled);
  renderSettings();
});
$('#style-choice').addEventListener('click', (e) => {
  const b = e.target.closest('[data-style]');
  if (!b) return;
  sound.setStyle(b.dataset.style);
  save('soundStyle', sound.style);
  renderSettings();
  sound.preview();
});
$('#tilt-toggle').addEventListener('click', toggleTilt);

// Ton und Bewegungssensor erst nach der ersten Berührung freischalten (iOS)
document.addEventListener('pointerdown', () => {
  sound.unlock();
  if (load('tilt', false) && !tilt.enabled) tilt.enable().then(renderSettings);
}, { passive: true });

// Doppeltipp-Zoom und Pinch-Zoom in Safari unterbinden
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());

// ---------- Start ----------

updateHud();
renderSettings();
if (game.history.length > 0 && game.isOver) showResult();
setTimeout(showCoach, 900);

// Offline-Betrieb. Übernimmt eine neue Version die Kontrolle, lädt die Seite einmal neu,
// damit nie Dateien zweier Versionen gleichzeitig laufen.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded) return;
    reloaded = true;
    location.reload();
  });
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {});
}

// Für automatische Tests im Browser
window.__spring = { view, get game() { return game; }, switchFigure, figures: FIGURES };
