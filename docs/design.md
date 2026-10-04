# Design-System

## Leitidee

Das Brett wirkt wie ein hochwertiges Objekt, das auf dem Tisch liegt: ein rundes, dunkelblaues Brett mit erhöhtem Rand und glänzenden Murmeln. Die Oberfläche drumherum bleibt ruhig und zurückhaltend, damit das Brett im Mittelpunkt steht.

Grundsätze:

* **Reduktion:** Nur drei Schaltflächen und ein Zähler. Keine Menüs während des Spiels.
* **Haptische Anmutung:** Licht, Schatten und Bewegung lassen die Murmeln greifbar wirken.
* **Ruhe:** Sanfte, kurze Animationen. Nichts blinkt oder drängt sich auf.
* **Klarheit:** Gültige Ziele sind immer sichtbar, sobald eine Murmel ausgewählt ist.

## Farben

### Brett (unabhängig vom Hell- oder Dunkelmodus)

| Element | Farbe | Verwendung |
|---|---|---|
| Brett außen | `#2a2f7a` bis `#14174a` | Radialer Verlauf, Licht von oben |
| Rinne | `#0b0d33` bis `#1c2060` | Vertiefung zwischen Rand und Spielfläche |
| Spielfläche | `#262b72` bis `#191c55` | Innere Scheibe |
| Kante Spielfläche | `#2f3588` | Feine Lichtkante |
| Linien | Weiß, 82 % Deckkraft | Verbindungen zwischen benachbarten Feldern |
| Mulden | `#05061c` bis `#11143f` | Freie Felder |
| Murmel blau | `#7fa6ff`, `#3f6ef0`, `#1d3cae` | Drei Stufen von Lichtpunkt bis Schatten |
| Murmel schwarz | `#5a5d6a`, `#1c1d24`, `#050507` | Drei Stufen von Lichtpunkt bis Schatten |

### Oberfläche (CSS-Variablen in `css/style.css`)

| Variable | Hell | Dunkel | Verwendung |
|---|---|---|---|
| `--bg` | `#ece8e1` | `#141519` | Hintergrund |
| `--bg-edge` | `#e2ddd4` | `#0d0e11` | Vignette am Rand |
| `--ink` | `#1a1d4e` | `#e9e7f2` | Text und Symbole |
| `--ink-soft` | `#6b6d85` | `#8f91a6` | Nebentexte |
| `--btn` | `#f7f4ef` | `#1e2027` | Schaltflächen |
| `--card` | `#faf8f4` | `#1e2027` | Ergebniskarte |
| `--accent` | `#3f6ef0` | `#3f6ef0` | Hervorhebung „Meisterhaft“ |

Der Modus folgt automatisch der Systemeinstellung des Geräts.

## Typografie

| Rolle | Schrift | Stil |
|---|---|---|
| Titel und Zahlen | Didot, Bodoni 72, Ersatz Georgia | Großbuchstaben, Laufweite 0,14 em |
| Text und Beschriftungen | San Francisco (Systemschrift) | Beschriftungen in Großbuchstaben, Laufweite 0,08 bis 0,16 em |

Alle Schriften sind auf Apple-Geräten vorinstalliert, es werden keine Webfonts geladen.

## Maße des Bretts

Das Brett ist ein SVG mit einem festen Koordinatensystem von 1000 × 1000 Einheiten und skaliert verlustfrei auf jede Bildschirmgröße.

| Element | Wert (SVG-Einheiten) |
|---|---|
| Radius Brett | 494 |
| Rinne außen und innen | 484 und 408 |
| Radius Spielfläche | 404 |
| Abstand der Felder | 110 |
| Radius Murmel | 37 |
| Radius Mulde | 13 |
| Linienstärke | 3 |

Die Rinne bietet Platz für bis zu 33 Murmeln, mehr als die maximal 31 geschlagenen.

## Bewegung

| Ereignis | Dauer | Verhalten |
|---|---|---|
| Murmel anheben | 140 ms | Wird 12 % größer, Schatten wandert nach unten und wird weicher |
| Sprung (Tippen) | 280 ms | Bogen über die übersprungene Murmel |
| Sprung (Ziehen) | 170 ms | Gleitet vom Loslassen-Punkt ins Ziel |
| Geschlagene Murmel | 420 ms | Rollt in die Rinne |
| Zurück | 260 bis 320 ms | Beide Murmeln kehren gleichzeitig zurück |
| Ungültige Murmel | 260 ms | Kurzes seitliches Wackeln |
| Zielfelder | 1,4 s Schleife | Gestrichelter Ring, pulsiert sanft |

Alle Bewegungen nutzen eine weiche Beschleunigung und Abbremsung. Ist auf dem Gerät „Bewegung reduzieren“ aktiv, springen die Murmeln ohne Animation an ihr Ziel.

## Klang

Die Klänge werden im Browser erzeugt, es gibt keine Audiodateien.

| Ereignis | Klang |
|---|---|
| Murmel landet | Heller, kurzer Keramik-Klack |
| Murmel rollt in den Rand | Tieferer, weicherer Klack |
| Ungültiger Tipp | Dumpfer, leiser Ton |
| Gelöst (1 Murmel) | Drei aufsteigende Klänge |

## Layout

| Situation | Anordnung |
|---|---|
| Hochformat (iPhone, iPad) | Titel und Zähler oben, Brett mittig, Schaltflächen unten |
| Querformat iPhone (Höhe unter 500 px) | Titel und Zähler links, Brett mittig, Schaltflächen rechts übereinander |
| Querformat iPad | Wie Hochformat, das Brett passt sich der Höhe an |

* Das Brett ist höchstens 820 px groß und füllt sonst den verfügbaren Platz.
* Abstände berücksichtigen Notch, Dynamic Island und Home-Indikator (`env(safe-area-inset-*)`), mindestens 16 px seitlich.
* Schaltflächen sind 54 px groß, über der von Apple empfohlenen Mindestgröße von 44 pt.
* Zoomen, Textauswahl und das Kontextmenü bei langem Drücken sind abgeschaltet, damit nichts das Spielen stört.

## App-Symbol

Das Symbol zeigt einen Ausschnitt des Bretts: neun Felder im Quadrat, die Mitte frei, blaue Murmeln in den Ecken und schwarze an den Seiten, auf dunkelblauem Grund. Die Ausgangsdatei ist `icons/icon.svg`, daraus entstehen die PNG-Dateien in 180, 192 und 512 Pixeln.
