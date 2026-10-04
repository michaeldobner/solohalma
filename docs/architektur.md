# Architektur

## Überblick

Solohalma ist eine statische Web-App ohne Server-Logik und ohne Build-Schritt. Der Browser lädt `index.html`, die Stylesheets und die JavaScript-Module direkt.

```
index.html
 ├─ css/style.css            Layout, Farben, Hell- und Dunkelmodus
 └─ js/main.js               Einstieg, verbindet alle Teile
     ├─ js/boards.js         Brett-Definitionen (reine Daten)
     ├─ js/game.js           Spiellogik (ohne Darstellung)
     ├─ js/view.js           SVG-Brett, Animationen, Eingabe
     ├─ js/sound.js          Klänge über die Web Audio API
     └─ js/storage.js        Speicherung im localStorage

sw.js                        Service Worker für den Offline-Betrieb
manifest.webmanifest         Angaben für die Installation als App
```

Die Trennung folgt einem einfachen Prinzip: **Daten → Logik → Darstellung**. Die Spiellogik kennt weder SVG noch Browser, sie lässt sich deshalb ohne Browser mit Node.js testen.

## Module

### `boards.js`: Bretter als Daten

Jedes Brett ist ein Eintrag mit Namen, Layout und Zielfeld:

```js
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
  goal: [3, 3],
}
```

| Zeichen | Bedeutung |
|---|---|
| `o` | Feld mit Murmel |
| `.` | Freies Feld |
| Leerzeichen | Kein Feld |

### `game.js`: Klasse `Game`

Die gesamte Spiellogik steckt in einer Klasse.

| Eigenschaft oder Methode | Aufgabe |
|---|---|
| `cells` | Liste aller Felder mit Zeile `r`, Spalte `c` und Startbelegung |
| `marbles` | Für jedes Feld die ID der Murmel darauf oder `null` |
| `history` | Liste aller ausgeführten Züge, Grundlage für Rückgängig und die Rinne |
| `cellAt(r, c)` | Feldindex zu einer Position, `-1` außerhalb des Bretts |
| `movesFrom(i)` | Alle gültigen Sprünge einer Murmel |
| `allMoves()` | Alle gültigen Sprünge auf dem Brett |
| `findMove(from, to)` | Prüft, ob ein bestimmter Sprung gültig ist |
| `apply(move)` | Führt einen Sprung aus und speichert ihn in `history` |
| `undo()` | Nimmt den letzten Sprung zurück |
| `count` | Anzahl der Murmeln auf dem Brett |
| `isOver`, `isPerfect` | Spielende und perfekte Lösung |
| `rating()` | Bewertung als Titel und Text |
| `serialize()`, `restore()` | Spielstand speichern und laden |

**Murmel-IDs:** Jede Murmel hat eine feste Nummer von 0 bis 31, vergeben in der Reihenfolge der Felder. Beim Springen wandert die ID mit. So kann die Darstellung jede Murmel als eigenes Objekt verfolgen und flüssig animieren, statt das Brett nach jedem Zug neu zu zeichnen.

**Ein Zug** ist ein Objekt `{ from, over, to }` mit drei Feldindizes. In `history` kommen die IDs der springenden (`marble`) und der geschlagenen Murmel (`captured`) hinzu.

### `view.js`: Klasse `BoardView`

Zeichnet das Brett als SVG und übersetzt Berührungen in Züge.

**Ebenen im SVG** (von unten nach oben):

1. Schatten, Brett, Rinne, Spielfläche
2. Linien zwischen benachbarten Feldern
3. Mulden
4. Ringe für gültige Ziele
5. Murmeln

**Koordinaten:** Das SVG hat 1000 × 1000 Einheiten. Feld `(r, c)` liegt bei

```
x = 500 + (c − 3) × 110
y = 500 + (r − 3) × 110
```

Geschlagene Murmeln liegen in der Rinne auf einem Kreis mit Radius 446. Die n-te geschlagene Murmel bekommt den n-ten Platz, beginnend unten und im Uhrzeigersinn. Der Platz ergibt sich direkt aus der Position in `history`, deshalb stimmt die Rinne auch nach Rückgängig und nach dem Laden eines Spielstands.

**Eingabe:** Pointer Events decken Finger, Stift und Maus gleich ab.

| Ereignis | Verhalten |
|---|---|
| `pointerdown` auf Zielfeld | Sprung der ausgewählten Murmel |
| `pointerdown` auf Murmel mit Zügen | Auswahl, möglicher Beginn eines Ziehens |
| `pointerdown` auf Murmel ohne Züge | Wackeln und dumpfer Ton |
| `pointermove` ab 10 px Bewegung | Murmel folgt dem Finger |
| `pointerup` nahe einem gültigen Ziel | Sprung |
| `pointerup` anderswo | Murmel rollt zurück |

Während einer Animation sind Eingaben gesperrt (`busy`), damit sich Züge nicht überlagern.

**Animationen** laufen über `requestAnimationFrame` mit einer eigenen kleinen Tween-Funktion. Die Murmeln werden über das `transform`-Attribut verschoben und skaliert.

### `main.js`: Zusammenspiel

`main.js` erzeugt `Game` und `BoardView`, lädt den Spielstand und reagiert auf die drei Phasen eines Zugs:

| Phase | Reaktion |
|---|---|
| `jump` | Zähler aktualisieren, Spielstand speichern |
| `land` | Klang „Landung“ |
| `gutter` | Klang „Rinne“, Spielende prüfen |

Außerdem steuert es die Schaltflächen, die Ergebniskarte und die Statistik.

### `sound.js` und `storage.js`

* **Klang:** Synthetisch erzeugt (Sinuston plus kurzes gefiltertes Rauschen). iOS erlaubt Ton erst nach einer Berührung, deshalb wird der Audio-Kontext beim ersten `pointerdown` geöffnet.
* **Speicherung:** Alle Werte liegen im `localStorage` mit dem Präfix `solohalma:`. Jeder Zugriff ist abgesichert, das Spiel läuft auch ohne Speicher (zum Beispiel im privaten Modus).

| Schlüssel | Inhalt |
|---|---|
| `solohalma:game:englisch` | Aktuelles Spiel (`marbles`, `history`, `counted`) |
| `solohalma:stats` | Spiele, Lösungen, perfekte Lösungen, bestes Ergebnis |
| `solohalma:sound` | Ton an oder aus |

## Ablauf eines Zugs

```
Finger tippt Ziel
   │
   ▼
BoardView.down() ── findMove() ──► gültig?
   │                                   │ nein → Auswahl aufheben
   ▼ ja
BoardView.play()
   ├─ Animation: Murmel springt im Bogen
   ├─ Game.apply()                 Zustand ändert sich sofort
   ├─ onMove('jump')               Zähler und Speicherung
   ├─ onMove('land')               Klang
   ├─ Animation: geschlagene Murmel rollt in die Rinne
   └─ onMove('gutter')             Klang, Spielende prüfen
```

## Offline-Betrieb

`sw.js` legt beim ersten Besuch alle Dateien in einen Cache. Anfragen gehen zuerst ins Netz, damit Updates sofort ankommen. Ohne Netz kommt die Antwort aus dem Cache. Details stehen im Dokument [Deployment](deployment.md).
