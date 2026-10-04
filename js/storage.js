// Speichern auf dem Gerät. Funktioniert auch, wenn localStorage gesperrt ist (dann ohne Speicherung).

const PREFIX = 'solohalma:';

export function load(name, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(name, value) {
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(value));
  } catch {
    // Speicher nicht verfügbar, Spiel läuft trotzdem weiter
  }
}
