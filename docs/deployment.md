# Deployment

## Überblick

Solohalma läuft auf **GitHub Pages** unter

**https://michaeldobner.github.io/solohalma/**

Die Veröffentlichung ist automatisiert:

```
Push auf main
   │
   ▼
GitHub Actions: Workflow „Pages“ (.github/workflows/pages.yml)
   ├─ Tests ausführen (npm test)
   └─ Bei Erfolg: Inhalt von main auf den Branch gh-pages übertragen
         │
         ▼
GitHub Pages veröffentlicht gh-pages automatisch
```

Schlagen die Tests fehl, wird nichts veröffentlicht und die Live-Version bleibt unverändert.

## Einstellungen im Repository

| Einstellung | Wert |
|---|---|
| Sichtbarkeit | Public (GitHub Pages ist für private Repos nur mit einem kostenpflichtigen Konto verfügbar) |
| Settings > Pages > Source | Deploy from a branch |
| Branch | `gh-pages`, Ordner `/ (root)` |
| Schreibrecht des Workflows | Im Workflow selbst gesetzt (`permissions: contents: write`) |

Die Datei `.nojekyll` sorgt dafür, dass GitHub die Dateien unverändert ausliefert.

## Ein Update veröffentlichen

1. Änderungen machen und lokal testen (siehe [Entwicklung](entwicklung.md)).
2. In `sw.js` die Konstante `VERSION` erhöhen, zum Beispiel von `solohalma-v1` auf `solohalma-v2`.
3. Neue Dateien in die Liste `FILES` in `sw.js` eintragen.
4. `CHANGELOG.md` ergänzen.
5. Auf `main` pushen. Nach ein bis zwei Minuten ist die neue Version live.

Den Stand der Veröffentlichung zeigt der Reiter **Actions** im Repository.

## Wie Updates auf die Geräte kommen

Der Service Worker fragt immer zuerst das Netz. Ein geöffnetes Spiel mit Internetverbindung lädt also stets die aktuelle Version. Durch die neue `VERSION` werden alte Caches beim nächsten Start gelöscht.

Ohne Internet startet die zuletzt geladene Version aus dem Cache.

## Fehlerbehebung

| Problem | Lösung |
|---|---|
| Seite zeigt 404 | Unter Settings > Pages prüfen, ob `gh-pages` als Quelle eingestellt ist, und ob der Workflow erfolgreich war |
| Workflow scheitert beim Push | Unter Settings > Actions > General prüfen, ob Actions erlaubt sind und Workflows Schreibrechte erhalten dürfen |
| iPhone zeigt alte Version | App schließen und neu öffnen. Notfalls in Safari: Einstellungen > Apps > Safari > Erweitert > Website-Daten, Eintrag `michaeldobner.github.io` löschen |
| App-Symbol fehlt auf dem Home-Bildschirm | Prüfen, ob `icons/apple-touch-icon.png` erreichbar ist, dann neu hinzufügen |
