// Brett-Definitionen als Daten.
// "o" = Feld mit Murmel, "." = freies Feld, " " = kein Feld.
// Ein neues Brett oder eine neue Startaufgabe ist nur ein neuer Eintrag hier.

export const BOARDS = {
  englisch: {
    name: 'Klassisch',
    layout: [
      '  ooo  ',
      '  ooo  ',
      'ooooooo',
      'ooo.ooo',
      'ooooooo',
      '  ooo  ',
      '  ooo  ',
    ],
    // Zielfeld für die perfekte Lösung (Zeile, Spalte)
    goal: [3, 3],
  },
};

export const DEFAULT_BOARD = 'englisch';
