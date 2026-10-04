// Darstellung des runden Bretts als SVG, inklusive Animationen und Touch-Bedienung.

const NS = 'http://www.w3.org/2000/svg';
const VB = 1000;
const CENTER = VB / 2;

const PLATE_R = 494; // Außenkante des Bretts
const GUTTER_OUTER = 484; // Rinne für geschlagene Murmeln
const GUTTER_INNER = 408;
const DISC_R = 404; // Spielfläche
const GUTTER_R = (GUTTER_OUTER + GUTTER_INNER) / 2;

const S = 110; // Abstand der Felder
const MR = 37; // Radius einer Murmel
const HOLE_R = 13;

const LIFT = 0.12; // Vergrößerung beim Anheben
const TAP_SLOP = 10; // Pixel, ab denen aus einem Tippen ein Ziehen wird

export class BoardView {
  constructor(svg, game, { onMove, onInvalid } = {}) {
    this.svg = svg;
    this.game = game;
    this.onMove = onMove || (() => {});
    this.onInvalid = onInvalid || (() => {});
    this.selected = -1;
    this.busy = false;
    this.drag = null;
    this.marbleEls = new Map();

    this.build();
    this.bindInput();
    this.sync();
  }

  // ---------- Geometrie ----------

  cellPos(i) {
    const { r, c } = this.game.cells[i];
    const mr = (this.game.rows - 1) / 2;
    const mc = (this.game.cols - 1) / 2;
    return { x: CENTER + (c - mc) * S, y: CENTER + (r - mr) * S };
  }

  gutterPos(slot) {
    // Geschlagene Murmeln reihen sich ab unten im Uhrzeigersinn in die Rinne
    const step = 2 * Math.asin((MR + 2.5) / GUTTER_R);
    const a = Math.PI / 2 + slot * step;
    return { x: CENTER + GUTTER_R * Math.cos(a), y: CENTER + GUTTER_R * Math.sin(a) };
  }

  // ---------- Aufbau ----------

  build() {
    const svg = this.svg;
    svg.setAttribute('viewBox', `0 0 ${VB} ${VB}`);
    svg.innerHTML = `
      <defs>
        <radialGradient id="g-plate" cx="50%" cy="38%" r="65%">
          <stop offset="0" stop-color="#2a2f7a"/>
          <stop offset="1" stop-color="#14174a"/>
        </radialGradient>
        <radialGradient id="g-gutter" cx="50%" cy="50%" r="50%">
          <stop offset="0.82" stop-color="#0b0d33"/>
          <stop offset="0.9" stop-color="#121543"/>
          <stop offset="1" stop-color="#1c2060"/>
        </radialGradient>
        <radialGradient id="g-disc" cx="50%" cy="40%" r="62%">
          <stop offset="0" stop-color="#262b72"/>
          <stop offset="1" stop-color="#191c55"/>
        </radialGradient>
        <radialGradient id="g-hole" cx="50%" cy="40%" r="60%">
          <stop offset="0" stop-color="#05061c"/>
          <stop offset="1" stop-color="#11143f"/>
        </radialGradient>
        <radialGradient id="g-blue" cx="36%" cy="32%" r="72%">
          <stop offset="0" stop-color="#7fa6ff"/>
          <stop offset="0.45" stop-color="#3f6ef0"/>
          <stop offset="1" stop-color="#1d3cae"/>
        </radialGradient>
        <radialGradient id="g-black" cx="36%" cy="32%" r="72%">
          <stop offset="0" stop-color="#5a5d6a"/>
          <stop offset="0.45" stop-color="#1c1d24"/>
          <stop offset="1" stop-color="#050507"/>
        </radialGradient>
        <radialGradient id="g-shine" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#fff" stop-opacity="0.9"/>
          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="g-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#000" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="g-plate-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0.86" stop-color="#000" stop-opacity="0.28"/>
          <stop offset="1" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="${CENTER + 4}" cy="${CENTER + 14}" r="${PLATE_R + 6}" fill="url(#g-plate-shadow)"/>
      <circle cx="${CENTER}" cy="${CENTER}" r="${PLATE_R}" fill="url(#g-plate)"/>
      <circle cx="${CENTER}" cy="${CENTER}" r="${GUTTER_OUTER}" fill="url(#g-gutter)"/>
      <circle cx="${CENTER}" cy="${CENTER}" r="${DISC_R}" fill="url(#g-disc)"
              stroke="#2f3588" stroke-width="3"/>
      <g class="lines"></g>
      <g class="holes"></g>
      <g class="targets"></g>
      <g class="marbles"></g>
    `;
    this.linesEl = svg.querySelector('.lines');
    this.holesEl = svg.querySelector('.holes');
    this.targetsEl = svg.querySelector('.targets');
    this.marblesEl = svg.querySelector('.marbles');

    // Feine weiße Linien zwischen benachbarten Feldern (nur waagerecht und senkrecht)
    const g = this.game;
    g.cells.forEach((cell, i) => {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const j = g.cellAt(cell.r + dr, cell.c + dc);
        if (j < 0) continue;
        const a = this.cellPos(i);
        const b = this.cellPos(j);
        this.linesEl.appendChild(el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y }));
      }
    });

    g.cells.forEach((_, i) => {
      const p = this.cellPos(i);
      this.holesEl.appendChild(el('circle', { cx: p.x, cy: p.y, r: HOLE_R, fill: 'url(#g-hole)' }));
    });

    // Jede Murmel bekommt ein festes Element. Blau und Schwarz wechseln sich im Schachbrettmuster ab.
    // Die IDs entstehen in derselben Reihenfolge wie in Game.reset(), auch wenn ein gespeichertes Spiel geladen wurde.
    let id = 0;
    g.cells.forEach((cell) => {
      if (!cell.start) return;
      const color = (cell.r + cell.c) % 2 === 0 ? 'blue' : 'black';
      this.marbleEls.set(id++, this.createMarble(color));
    });
  }

  createMarble(color) {
    const group = el('g', { class: `marble ${color}` });
    const shadow = el('ellipse', { class: 'shadow', rx: MR * 1.05, ry: MR * 0.9, fill: 'url(#g-shadow)' });
    const body = el('circle', { r: MR, fill: `url(#g-${color})` });
    const shine = el('ellipse', {
      cx: -MR * 0.3, cy: -MR * 0.36, rx: MR * 0.36, ry: MR * 0.24,
      fill: 'url(#g-shine)', transform: 'rotate(-30)',
    });
    group.append(shadow, body, shine);
    this.marblesEl.appendChild(group);
    return { group, shadow, x: 0, y: 0, lift: 0 };
  }

  place(m, x, y, lift = 0) {
    m.x = x;
    m.y = y;
    m.lift = lift;
    const s = 1 + LIFT * lift;
    m.group.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`);
    const off = 5 + 16 * lift;
    m.shadow.setAttribute('cx', (off * 0.5).toFixed(1));
    m.shadow.setAttribute('cy', off.toFixed(1));
    m.shadow.setAttribute('opacity', (1 - 0.35 * lift).toFixed(2));
  }

  // Alle Murmeln ohne Animation auf ihre Position setzen (nach Laden, Neustart)
  sync() {
    const g = this.game;
    g.marbles.forEach((id, i) => {
      if (id === null) return;
      const p = this.cellPos(i);
      this.place(this.marbleEls.get(id), p.x, p.y);
    });
    g.history.forEach((rec, slot) => {
      const p = this.gutterPos(slot);
      this.place(this.marbleEls.get(rec.captured), p.x, p.y);
    });
    this.select(-1);
  }

  // ---------- Auswahl und Ziele ----------

  select(i) {
    if (this.selected >= 0) {
      const prev = this.marbleEls.get(this.game.marbles[this.selected]);
      if (prev && !this.drag) this.animateLift(prev, 0);
    }
    this.selected = i;
    this.targetsEl.innerHTML = '';
    if (i < 0) return;

    const m = this.marbleEls.get(this.game.marbles[i]);
    this.marblesEl.appendChild(m.group);
    this.animateLift(m, 1);
    for (const move of this.game.movesFrom(i)) {
      const p = this.cellPos(move.to);
      this.targetsEl.appendChild(el('circle', { class: 'target', cx: p.x, cy: p.y, r: MR * 0.72 }));
    }
  }

  animateLift(m, to) {
    const from = m.lift;
    tween(140, (t) => this.place(m, m.x, m.y, from + (to - from) * t));
  }

  // ---------- Züge ----------

  async play(move, fromPos) {
    this.busy = true;
    this.targetsEl.innerHTML = '';
    const g = this.game;
    const m = this.marbleEls.get(g.marbles[move.from]);
    const cap = this.marbleEls.get(g.marbles[move.over]);
    const start = fromPos || { x: m.x, y: m.y };
    const startLift = m.lift;
    const end = this.cellPos(move.to);
    const slot = g.history.length;

    this.selected = -1;
    this.marblesEl.appendChild(m.group);

    // Sprung im kleinen Bogen
    const jump = tween(fromPos ? 170 : 280, (t) => {
      const lift = fromPos ? startLift * (1 - t) : Math.max(startLift * (1 - t), Math.sin(Math.PI * t));
      this.place(m, lerp(start.x, end.x, t), lerp(start.y, end.y, t), lift);
    });

    const record = g.apply(move);
    this.onMove(record, 'jump');

    await jump;
    this.onMove(record, 'land');

    // Die geschlagene Murmel rollt in die Rinne
    const gp = this.gutterPos(slot);
    const cs = { x: cap.x, y: cap.y };
    this.marblesEl.insertBefore(cap.group, this.marblesEl.firstChild);
    await tween(420, (t) => {
      this.place(cap, lerp(cs.x, gp.x, t), lerp(cs.y, gp.y, t), 0.6 * Math.sin(Math.PI * t));
    });
    this.onMove(record, 'gutter');
    this.busy = false;
    return record;
  }

  async undo() {
    if (this.busy) return null;
    const g = this.game;
    const rec = g.undo();
    if (!rec) return null;
    this.busy = true;
    this.select(-1);
    const m = this.marbleEls.get(rec.marble);
    const cap = this.marbleEls.get(rec.captured);
    const back = this.cellPos(rec.from);
    const over = this.cellPos(rec.over);
    const ms = { x: m.x, y: m.y };
    const cs = { x: cap.x, y: cap.y };
    await Promise.all([
      tween(320, (t) => this.place(cap, lerp(cs.x, over.x, t), lerp(cs.y, over.y, t), 0.6 * Math.sin(Math.PI * t))),
      tween(260, (t) => this.place(m, lerp(ms.x, back.x, t), lerp(ms.y, back.y, t), Math.sin(Math.PI * t))),
    ]);
    this.busy = false;
    return rec;
  }

  shake(i) {
    const m = this.marbleEls.get(this.game.marbles[i]);
    const { x, y } = m;
    tween(260, (t) => this.place(m, x + Math.sin(t * Math.PI * 5) * 6 * (1 - t), y));
  }

  // ---------- Eingabe ----------

  toSvg(evt) {
    const pt = this.svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    return pt.matrixTransform(this.svg.getScreenCTM().inverse());
  }

  cellNear(p, radius = S * 0.5) {
    let best = -1;
    let bestD = radius;
    this.game.cells.forEach((_, i) => {
      const c = this.cellPos(i);
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  }

  bindInput() {
    const svg = this.svg;
    svg.addEventListener('pointerdown', (e) => this.down(e));
    svg.addEventListener('pointermove', (e) => this.moveDrag(e));
    svg.addEventListener('pointerup', (e) => this.up(e));
    svg.addEventListener('pointercancel', () => this.cancelDrag());
  }

  down(e) {
    if (this.busy || this.drag) return;
    e.preventDefault();
    const p = this.toSvg(e);
    const i = this.cellNear(p);
    const g = this.game;

    // Tippen auf ein Ziel der ausgewählten Murmel
    if (this.selected >= 0 && i >= 0 && g.isEmpty(i)) {
      const move = g.findMove(this.selected, i);
      if (move) {
        this.play(move);
        return;
      }
    }

    if (i < 0 || !g.hasMarble(i)) {
      this.select(-1);
      return;
    }

    if (g.movesFrom(i).length === 0) {
      this.select(-1);
      this.shake(i);
      this.onInvalid();
      return;
    }

    if (this.selected !== i) this.select(i);
    const m = this.marbleEls.get(g.marbles[i]);
    capturePointer(this.svg, e.pointerId);
    this.drag = {
      id: e.pointerId, from: i, m,
      sx: e.clientX, sy: e.clientY,
      ox: m.x - p.x, oy: m.y - p.y,
      active: false,
    };
  }

  moveDrag(e) {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    if (!d.active && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < TAP_SLOP) return;
    d.active = true;
    const p = this.toSvg(e);
    this.place(d.m, p.x + d.ox, p.y + d.oy, 1);
  }

  up(e) {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    this.drag = null;
    if (!d.active) return; // einfaches Tippen: Murmel bleibt ausgewählt

    const target = this.cellNear({ x: d.m.x, y: d.m.y }, S * 0.6);
    const move = target >= 0 ? this.game.findMove(d.from, target) : null;
    if (move) {
      this.play(move, { x: d.m.x, y: d.m.y });
    } else {
      this.returnHome(d);
    }
  }

  cancelDrag() {
    const d = this.drag;
    if (!d) return;
    this.drag = null;
    if (d.active) this.returnHome(d);
  }

  returnHome(d) {
    const home = this.cellPos(d.from);
    const s = { x: d.m.x, y: d.m.y };
    this.busy = true;
    tween(180, (t) => this.place(d.m, lerp(s.x, home.x, t), lerp(s.y, home.y, t), 1)).then(() => {
      this.busy = false;
    });
  }
}

// ---------- Hilfsfunktionen ----------

function el(name, attrs = {}) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function capturePointer(svg, id) {
  try {
    svg.setPointerCapture(id);
  } catch {
    // Manche Browser erlauben das nicht für jedes Ereignis, das Spiel funktioniert trotzdem
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function ease(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function tween(duration, step) {
  return new Promise((resolve) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      step(1);
      resolve();
      return;
    }
    const t0 = performance.now();
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      step(ease(t));
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}
