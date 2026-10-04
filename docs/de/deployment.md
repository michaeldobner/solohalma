# Deployment

[English version](../en/deployment.md) · [Übersicht](README.md)

## Überblick

SPRING läuft auf **GitHub Pages** unter

**https://michaeldobner.github.io/solohalma/**

```
Push auf main
   │
   ├─► GitHub Pages veröffentlicht main direkt (Workflow „pages build and deployment“)
   │
   └─► GitHub Actions: Workflow „Tests“ prüft die Logik (.github/workflows/tests.yml)
```

Es gibt keinen Build-Schritt. Die Dateien aus `main` werden unverändert ausgeliefert. Änderungen deshalb immer auf einem eigenen Branch entwickeln, dort testen lassen und erst dann in `main` übernehmen.

## Einstellungen im Repository

| Einstellung | Wert |
|---|---|
| Sichtbarkeit | Public (GitHub Pages ist für private Repos nur mit einem kostenpflichtigen Konto verfügbar) |
| Settings > Pages > Source | Deploy from a branch |
| Branch | `main`, Ordner `/ (root)` |

Die Datei `.nojekyll` sorgt dafür, dass GitHub die Dateien unverändert ausliefert.

## Eine neue Version veröffentlichen

1. Änderungen auf einem Branch machen und prüfen (siehe [Entwicklung](entwicklung.md#checkliste-vor-dem-veröffentlichen)).
2. In `sw.js` die Konstante `VERSION` erhöhen, zum Beispiel `spring-v2.0.0` auf `spring-v2.1.0`, und neue Dateien in `FILES` eintragen.
3. `VERSION` in `js/main.js` und `version` in `package.json` anpassen.
4. Beide Changelogs ergänzen.
5. Branch in `main` übernehmen. Nach ein bis zwei Minuten ist die neue Version live.

Den Stand zeigt der Reiter **Actions** im Repository.

## Wie Updates auf die Geräte kommen

Der Service Worker fragt immer zuerst das Netz. Ein geöffnetes Spiel mit Internetverbindung lädt also stets die aktuelle Version. Durch die neue `VERSION` werden alte Caches beim nächsten Start gelöscht. Ohne Internet startet die zuletzt geladene Version.

Spielstände liegen im `localStorage` der Adresse `michaeldobner.github.io` und bleiben bei Updates erhalten.

## Umbenennen des Repositorys

Wird das Repository umbenannt, ändert sich die Adresse (zum Beispiel `/spring/`). GitHub Pages leitet die alte Adresse **nicht** weiter. Installierte Home-Bildschirm-Apps müssen dann neu angelegt werden. Spielstände bleiben erhalten, weil sie an `michaeldobner.github.io` hängen und nicht am Pfad.

## Fehlerbehebung

| Problem | Lösung |
|---|---|
| Seite zeigt 404 | Unter Settings > Pages prüfen, ob `main` und `/ (root)` eingestellt sind und „pages build and deployment“ erfolgreich war |
| Workflow „Tests“ ist rot | `npm test` lokal ausführen, Fehler beheben, erneut pushen |
| iPhone zeigt alte Version | App schließen und neu öffnen. Notfalls: Einstellungen > Apps > Safari > Erweitert > Website-Daten, Eintrag `michaeldobner.github.io` löschen (löscht auch Spielstände) |
| Kein Ton | Lautlos-Schalter prüfen, Ton in den Einstellungen prüfen, einmal aufs Brett tippen (iOS gibt Ton erst nach einer Berührung frei) |
| Neigen reagiert nicht | Neigen in den Einstellungen aus- und wieder einschalten und die Frage nach dem Bewegungssensor erlauben. Funktioniert nur über HTTPS |
| App-Symbol fehlt | Prüfen, ob `icons/apple-touch-icon.png` erreichbar ist, dann neu zum Home-Bildschirm hinzufügen |
