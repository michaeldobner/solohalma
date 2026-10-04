import { BOARDS, DEFAULT_BOARD } from './boards.js';
import { Game } from './game.js';
import { BoardView } from './view.js';
import { Sound } from './sound.js';
import { load, save } from './storage.js';

const $ = (sel) => document.querySelector(sel);

const boardId = DEFAULT_BOARD;
const game = new Game(BOARDS[boardId]);
const sound = new Sound(load('sound', true));
let stats = load('stats', { games: 0, solved: 0, perfect: 0, best: null });
let counted = false; // Wurde das aktuelle Spiel schon in die Statistik übernommen?

const saved = load(`game:${boardId}`, null);
if (saved && game.restore(saved)) counted = Boolean(saved.counted);

const view = new BoardView($('#board'), game, {
  onMove(record, phase) {
    if (phase === 'jump') {
      updateCount();
      persist();
      haptic(8);
    } else if (phase === 'land') {
      sound.land();
    } else if (phase === 'gutter') {
      sound.gutter();
      checkEnd();
    }
  },
  onInvalid() {
    sound.invalid();
    haptic(20);
  },
});

// ---------- Anzeige ----------

function updateCount() {
  const n = game.count;
  $('#count').textContent = n;
  $('#count-label').textContent = n === 1 ? 'Murmel' : 'Murmeln';
  $('#undo').disabled = game.history.length === 0;
}

function persist() {
  save(`game:${boardId}`, { ...game.serialize(), counted });
}

function checkEnd() {
  if (!game.isOver) return;
  const n = game.count;
  if (!counted) {
    counted = true;
    stats.games += 1;
    if (n === 1) stats.solved += 1;
    if (game.isPerfect) stats.perfect += 1;
    if (stats.best === null || n < stats.best) stats.best = n;
    save('stats', stats);
    persist();
  }
  if (n === 1) sound.win();
  showResult();
}

function showResult() {
  const { title, text } = game.rating();
  $('#result-title').textContent = title;
  $('#result-text').textContent = text;
  const best = stats.best === null ? '' : `Bestes Ergebnis: ${stats.best} ${stats.best === 1 ? 'Murmel' : 'Murmeln'}`;
  const solved = stats.solved > 0 ? ` · Gelöst: ${stats.solved}×` : '';
  $('#result-stats').textContent = best + solved;
  $('#result').classList.toggle('perfect', game.isPerfect);
  $('#result').hidden = false;
  requestAnimationFrame(() => $('#result').classList.add('show'));
}

function hideResult() {
  const r = $('#result');
  r.classList.remove('show');
  r.hidden = true;
}

// ---------- Bedienung ----------

function newGame() {
  hideResult();
  game.reset();
  counted = false;
  view.sync();
  updateCount();
  persist();
}

async function undo() {
  hideResult();
  const rec = await view.undo();
  if (!rec) return;
  sound.land();
  updateCount();
  persist();
}

// Neustart braucht zwei Tipps, damit ein laufendes Spiel nicht aus Versehen verloren geht
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

function toggleSound() {
  sound.enabled = !sound.enabled;
  save('sound', sound.enabled);
  updateSoundButton();
}

function updateSoundButton() {
  const btn = $('#sound');
  btn.classList.toggle('off', !sound.enabled);
  btn.setAttribute('aria-pressed', String(sound.enabled));
  btn.setAttribute('aria-label', sound.enabled ? 'Ton aus' : 'Ton an');
}

function haptic(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

$('#undo').addEventListener('click', undo);
$('#restart').addEventListener('click', restart);
$('#sound').addEventListener('click', toggleSound);
$('#again').addEventListener('click', newGame);
$('#back').addEventListener('click', undo);

// Ton erst nach der ersten Berührung freischalten (iOS)
document.addEventListener('pointerdown', () => sound.unlock(), { passive: true });

// Doppeltipp-Zoom und Pinch-Zoom in Safari unterbinden
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());

updateCount();
updateSoundButton();
if (game.history.length > 0 && game.isOver) showResult();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
