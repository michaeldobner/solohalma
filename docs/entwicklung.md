# Entwicklung

## Voraussetzungen

* Node.js ab Version 18 (nur für Tests und den lokalen Server)
* Ein moderner Browser

Es gibt keine Abhängigkeiten zu installieren und keinen Build-Schritt.

## Lokal starten

```
npm start
```

Startet einen lokalen Server, die Adresse steht in der Ausgabe (meist `http://localhost:3000`). Ein Server ist nötig, weil Browser ES-Module und Service Worker nicht direkt aus Dateien laden.

## Tests

```
npm test
```

Die Tests in `tests/game.test.js` prüfen die Spiellogik mit dem eingebauten Test-Runner von Node.js:

| Test | Prüft |
|---|---|
| Startstellung | 33 Felder, 32 Murmeln, Mitte frei |
| Erste Züge | Genau 4 mögliche Sprünge, alle in die Mitte |
| Keine Diagonalen | Diagonale Sprünge werden abgelehnt |
| Sprung und Rückgängig | Murmel wird entfernt und vollständig wiederhergestellt |
| Speichern und Laden | Spielstand übersteht JSON, ungültige Daten werden abgelehnt |
| Komplette Lösung | Ein eingebauter Löser findet eine Lösung, sie endet mit „Meisterhaft“ |
| Bewertung | Bewertung zu Spielbeginn |

## Auf iPhone oder iPad testen

**Im lokalen Netz:**

1. `npm start` auf dem Rechner ausführen.
2. Auf dem iPhone in Safari `http://<IP-des-Rechners>:3000` öffnen.

Ohne HTTPS funktioniert der Service Worker nicht, alles andere schon.

**Fehlersuche mit dem Mac:**

1. Auf dem iPhone: Einstellungen > Apps > Safari > Erweitert > Web-Inspektor einschalten.
2. iPhone per Kabel verbinden.
3. Am Mac in Safari: Menü Entwickler > Name des iPhones > Seite auswählen.

## Konventionen

* **Sprache:** Kommentare, Texte und Dokumentation auf Deutsch.
* **Schreibstil:** Keine Gedankenstriche in Texten. Stattdessen Komma, Punkt, Doppelpunkt oder ein umformulierter Satz.
* **JavaScript:** ES-Module, `const` und `let`, Klassen für zustandsbehaftete Teile, kleine reine Funktionen für Hilfen.
* **Trennung:** Spiellogik in `game.js` greift nie auf `document` oder `window` zu.
* **Farben:** Neue Oberflächenfarben immer als CSS-Variable in `:root` und im Dunkelmodus anlegen.
* **Größen:** Tippflächen mindestens 44 pt.

## Checkliste vor dem Veröffentlichen

1. `npm test` läuft ohne Fehler.
2. Im Browser auf Hochformat, Querformat und Dunkelmodus geprüft.
3. Konsole zeigt keine Fehler.
4. `VERSION` in `sw.js` erhöht, wenn sich Dateien geändert haben.
5. Neue Dateien in die Liste `FILES` in `sw.js` eingetragen.
6. `CHANGELOG.md` ergänzt.
