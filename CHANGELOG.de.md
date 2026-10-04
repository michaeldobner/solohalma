# Changelog

Alle wichtigen Änderungen an SPRING. [English](CHANGELOG.md)

## 2.0.0 (2026-10-04)

Das Spiel heißt jetzt **SPRING**.

### Neu
* **7 Figuren**, sortiert nach Schwierigkeit: Kreuz, Plus, Pyramide, Pfeil, Raute, Kamin, Klassisch. Jede Figur ist bis auf eine Murmel in der Mitte lösbar, geprüft mit dem Löser.
* **Figur im Spiel wechseln** über den Figurennamen im Kopf, die Schaltfläche Figuren oder die Seitenleiste auf dem iPad quer. Das Brett baut sich animiert um.
* **Eigener Spielstand pro Figur**: Beim Wechseln geht nie ein Spiel verloren.
* **Sterne** pro Figur (bis zu drei) und Statistik pro Figur.
* Schaltfläche **Nächste Figur** auf der Ergebniskarte.
* **Tipps**: Ein Löser in einem Web Worker zeigt den nächsten richtigen Zug.
* **Lebendiger Rand**: Geschlagene und ungenutzte Murmeln liegen lose im Rand und reagieren auf Antippen und Wischen mit Physik, Stößen und Klang.
* **Neigen** (optional): Murmeln im Rand rollen, wenn das Gerät geneigt wird.
* **Neues Klangdesign** in vier Schichten (Anschlag, Holz, Keramik, Raum), gestimmt auf eine pentatonische Tonleiter, steigt mit dem Fortschritt. Drei Klangfarben: Warm, Klar, Weich.
* **Zweisprachig**: Deutsch auf deutsch eingestellten Geräten, sonst Englisch.
* **Einstellungen** mit Ton, Klangfarbe und Neigen.
* Einmaliger Hinweis beim ersten Start, wo die Figur gewechselt wird.

### Geändert
* Es gibt immer alle 32 Murmeln. Murmeln, die eine Figur nicht braucht, liegen im Rand.
* Steuerung: Zurück, Tipp, Neu, Figuren, Mehr.
* Das iPhone respektiert den Lautlos-Schalter.
* Spielstand und Statistik aus Version 1 werden automatisch übernommen.

### Technik
* Neue Module: `figures.js`, `gutter.js`, `solver.js`, `solver-worker.js`, `tilt.js`, `i18n.js`.
* 26 automatische Tests, bei jedem Push über GitHub Actions.
* Dokumentation vollständig auf Deutsch und Englisch.

## 1.0.0 (2026-10-04)

Erste Version, damals noch unter dem Namen Solohalma.

* Klassisches englisches Brett mit 33 Feldern und 32 Murmeln
* Tippen oder Ziehen, Rückgängig ohne Begrenzung, Bewertung am Spielende
* Rundes dunkelblaues Brett, geschlagene Murmeln rollen in den Rand
* Hell- und Dunkelmodus, Hoch- und Querformat
* Progressive Web App, offline spielbar
