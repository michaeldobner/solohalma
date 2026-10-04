# Solohalma

**Das klassische Denkspiel für iPhone und iPad.** 33 Felder, 32 Murmeln, ein Ziel: Am Ende soll nur eine Murmel übrig bleiben, perfekt genau in der Mitte.

**▶ Jetzt spielen: https://michaeldobner.github.io/solohalma/**

Kein App Store, keine Installation nötig. Läuft im Browser, lässt sich als App auf den Home-Bildschirm legen und funktioniert danach auch offline.

## Highlights

* **Klassisches englisches Kreuzbrett** mit 33 Feldern, Mitte frei
* **Rundes, dunkelblaues Brett** mit glänzenden blauen und schwarzen Murmeln
* **Geschlagene Murmeln rollen in den Rand** und zeigen jederzeit den Fortschritt
* **Tippen oder Ziehen:** gültige Ziele leuchten auf
* **Rückgängig** ohne Begrenzung
* **Bewertung** am Ende, von „Weiter üben“ bis „Meisterhaft“
* **Spielstand und Statistik** werden automatisch gespeichert
* **Hoch- und Querformat, Hell- und Dunkelmodus**
* **Offline spielbar**, klein und schnell, ohne Werbung und ohne Tracking

## So wird gespielt

1. Eine Murmel springt **waagerecht oder senkrecht** über eine benachbarte Murmel auf ein freies Feld.
2. Die übersprungene Murmel wird entfernt.
3. Das Spiel endet, wenn kein Sprung mehr möglich ist.

Die vollständigen Regeln, die Bewertung und Tipps stehen in [Spielregeln und Bedienung](docs/spielregeln.md).

## Auf iPhone oder iPad installieren

1. https://michaeldobner.github.io/solohalma/ in **Safari** öffnen.
2. Auf **Teilen** tippen, dann **Zum Home-Bildschirm**.
3. Fertig: Solohalma startet im Vollbild wie eine App.

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [Spielregeln und Bedienung](docs/spielregeln.md) | Regeln, Bewertung, Bedienung, Installation |
| [Design-System](docs/design.md) | Farben, Maße, Typografie, Animationen, Layout |
| [Architektur](docs/architektur.md) | Module, Datenmodell, Ablauf eines Zugs |
| [Entwicklung](docs/entwicklung.md) | Lokal starten, Tests, Konventionen |
| [Erweitern](docs/erweitern.md) | Neue Startaufgaben, Farbthemen, Roadmap |
| [Deployment](docs/deployment.md) | Veröffentlichung, Updates, Fehlerbehebung |
| [Changelog](CHANGELOG.md) | Versionshistorie |

## Schnellstart für Entwicklung

```
npm start   # lokaler Server
npm test    # Tests der Spiellogik
```

Keine Abhängigkeiten, kein Build-Schritt. Jeder Push wird automatisch getestet, `main` wird direkt auf GitHub Pages veröffentlicht.

## Technik

| Bereich | Umsetzung |
|---|---|
| Sprache | HTML, CSS, JavaScript (ES-Module) |
| Grafik | SVG, verlustfrei skalierbar auf jedem Display |
| Offline | Service Worker und Web App Manifest |
| Speicherung | localStorage auf dem Gerät |
| Hosting | GitHub Pages |
| Tests | Node.js Test-Runner |

## Projektstruktur

```
├─ index.html              Einstiegsseite
├─ css/style.css           Layout und Farben
├─ js/
│  ├─ main.js              Verbindet alle Teile
│  ├─ boards.js            Bretter als Daten
│  ├─ game.js              Spiellogik
│  ├─ view.js              Brett, Animationen, Eingabe
│  ├─ sound.js             Klänge
│  └─ storage.js           Speicherung
├─ icons/                  App-Symbole
├─ sw.js                   Offline-Betrieb
├─ manifest.webmanifest    Installation als App
├─ tests/                  Tests der Spiellogik
└─ docs/                   Dokumentation
```

## Roadmap

* **Phase 1, fertig:** Klassisches Brett, komplette Bedienung, Offline, Installation als App
* **Phase 2, geplant:** Tipp-Funktion, klassische Startaufgaben, Farbthemen
* **Phase 3, Idee:** Tagesaufgabe, App-Store-Version

Details unter [Erweitern](docs/erweitern.md).
