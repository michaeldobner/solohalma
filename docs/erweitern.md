# Erweitern

Solohalma ist so aufgebaut, dass neue Inhalte möglichst ohne Eingriff in die Spiellogik entstehen.

## Neue Startaufgabe hinzufügen

Auf dem englischen Brett gibt es klassische Aufgaben, die mit weniger Murmeln beginnen. Jede Aufgabe ist nur ein neuer Eintrag in `js/boards.js`.

Beispiel „Kreuz“ (6 Murmeln, Ziel Mitte):

```js
kreuz: {
  name: 'Kreuz',
  layout: [
    '  ...  ',
    '  .o.  ',
    '..ooo..',
    '...o...',
    '...o...',
    '  ...  ',
    '  ...  ',
  ],
  goal: [3, 3],
},
```

Regeln für das Layout:

* Sieben Zeilen mit je sieben Zeichen, damit Koordinaten und Darstellung zum Brett passen.
* `o` für eine Murmel, `.` für ein leeres Feld, Leerzeichen außerhalb des Kreuzes.
* `goal` gibt das Feld an, auf dem die letzte Murmel für „Meisterhaft“ liegen muss.

Danach braucht es nur noch eine Auswahl in der Oberfläche, die `new Game(BOARDS[id])` mit der gewünschten Aufgabe startet. Spielstände werden bereits pro Brett gespeichert (`solohalma:game:<id>`).

Wichtig: Die Darstellung vergibt die Murmelfarben nach der Startposition. Das funktioniert für jede Aufgabe automatisch.

## Farbthema hinzufügen

Die Brettfarben stehen als Verläufe in `BoardView.build()` in `js/view.js`, die Oberflächenfarben als CSS-Variablen in `css/style.css`. Ein Farbthema besteht also aus:

1. einem Satz Verlaufsfarben für Brett, Rinne, Spielfläche und beide Murmelfarben,
2. einem Satz CSS-Variablen für den Hintergrund.

Empfohlener Weg: Die Verlaufsfarben in ein Objekt `THEMES` auslagern und beim Aufbau des SVG einsetzen. Das gewählte Thema wird wie der Ton über `storage.js` gespeichert.

## Tipp-Funktion

Ein Löser existiert bereits in `tests/game.test.js` (Tiefensuche mit Merkliste bekannter Stellungen). Für einen Tipp im Spiel:

1. Den Löser nach `js/solver.js` verschieben.
2. Ab der aktuellen Stellung eine Lösung suchen und den ersten Zug zurückgeben.
3. Die Suche in einem Web Worker laufen lassen, damit die Oberfläche flüssig bleibt.
4. Den Zug mit einem Ring auf Start- und Zielfeld anzeigen.

Liefert der Löser keine Lösung mehr, kann die App darauf hinweisen, dass von hier aus keine perfekte Lösung mehr möglich ist.

## Roadmap

| Phase | Inhalt | Status |
|---|---|---|
| 1 | Klassisches Brett, Tippen und Ziehen, Rückgängig, Bewertung, Statistik, Offline, Installation als App | Fertig |
| 2 | Tipp-Funktion, klassische Startaufgaben (Kreuz, Plus, Pyramide, Pfeil, Kamin), Farbthemen, erweiterte Statistik | Geplant |
| 3 | Tagesaufgabe, Version für den App Store mit Vibrationsrückmeldung | Idee |

Hinweis zu Phase 3: Safari auf iPhone und iPad bietet Web-Apps keine Vibration an. Spürbare Rückmeldung gibt es erst in einer App-Store-Version, zum Beispiel über Capacitor mit derselben Codebasis.
