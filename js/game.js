// Spiellogik ohne Darstellung. Kennt nur Felder, Murmeln und Sprünge.

const DIRECTIONS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export class Game {
  constructor(board) {
    this.board = board;
    this.rows = board.layout.length;
    this.cols = Math.max(...board.layout.map((line) => line.length));
    this.cells = [];
    this.index = new Map();

    board.layout.forEach((line, r) => {
      [...line].forEach((ch, c) => {
        if (ch === ' ') return;
        this.index.set(key(r, c), this.cells.length);
        this.cells.push({ r, c, start: ch === 'o' });
      });
    });

    this.reset();
  }

  reset() {
    // marbles[i] = Murmel-ID auf Feld i oder null.
    // Die ID bleibt beim Springen erhalten, damit die Darstellung Murmeln verfolgen kann.
    let id = 0;
    this.marbles = this.cells.map((cell) => (cell.start ? id++ : null));
    this.history = [];
  }

  cellAt(r, c) {
    const i = this.index.get(key(r, c));
    return i === undefined ? -1 : i;
  }

  hasMarble(i) {
    return i >= 0 && this.marbles[i] !== null;
  }

  isEmpty(i) {
    return i >= 0 && this.marbles[i] === null;
  }

  get count() {
    return this.marbles.reduce((n, m) => n + (m === null ? 0 : 1), 0);
  }

  movesFrom(from) {
    if (!this.hasMarble(from)) return [];
    const { r, c } = this.cells[from];
    const moves = [];
    for (const [dr, dc] of DIRECTIONS) {
      const over = this.cellAt(r + dr, c + dc);
      const to = this.cellAt(r + 2 * dr, c + 2 * dc);
      if (this.hasMarble(over) && this.isEmpty(to)) moves.push({ from, over, to });
    }
    return moves;
  }

  allMoves() {
    return this.cells.flatMap((_, i) => this.movesFrom(i));
  }

  findMove(from, to) {
    return this.movesFrom(from).find((m) => m.to === to) || null;
  }

  apply(move) {
    const marble = this.marbles[move.from];
    const captured = this.marbles[move.over];
    this.marbles[move.to] = marble;
    this.marbles[move.from] = null;
    this.marbles[move.over] = null;
    const record = { ...move, marble, captured };
    this.history.push(record);
    return record;
  }

  undo() {
    const record = this.history.pop();
    if (!record) return null;
    this.marbles[record.from] = record.marble;
    this.marbles[record.over] = record.captured;
    this.marbles[record.to] = null;
    return record;
  }

  get isOver() {
    return this.allMoves().length === 0;
  }

  get isPerfect() {
    const [gr, gc] = this.board.goal;
    return this.count === 1 && this.hasMarble(this.cellAt(gr, gc));
  }

  // Bewertung am Spielende
  rating() {
    const n = this.count;
    if (this.isPerfect) return { title: 'Meisterhaft', text: 'Eine Murmel, genau in der Mitte.' };
    if (n === 1) return { title: 'Sehr gut', text: 'Nur noch eine Murmel übrig.' };
    if (n === 2) return { title: 'Gut', text: 'Zwei Murmeln übrig.' };
    if (n === 3) return { title: 'Ordentlich', text: 'Drei Murmeln übrig.' };
    return { title: 'Weiter üben', text: `${n} Murmeln übrig.` };
  }

  // Spielstand für localStorage
  serialize() {
    return { marbles: this.marbles, history: this.history };
  }

  restore(data) {
    if (!data || !Array.isArray(data.marbles) || data.marbles.length !== this.cells.length) return false;
    this.marbles = data.marbles;
    this.history = Array.isArray(data.history) ? data.history : [];
    return true;
  }
}

function key(r, c) {
  return `${r},${c}`;
}
