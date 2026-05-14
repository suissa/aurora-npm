# Aurora Paketmanager

Ein leistungsstarker, eigenständiger Paketmanager für die Sprache **Aurora Austral**, entwickelt ohne **externe Abhängigkeiten**.

## Installation

```bash
npm install -g @aurora.purecore.codes/latest@1.1.0
```

**Hinweis:** Dieses Paket ist vollständig eigenständig. Es verwendet ausschließlich native Node.js-APIs (`fetch`, `fs`, `path`, `os`, `child_process`).

## Hauptbefehle

- `aurora init`: Initialisiert ein neues Projekt und konfiguriert den lokalen Compiler.
- `aurora install <paket>`: Lädt ein Paket aus dem offiziellen Repository herunter, kompiliert und testet es.
- `aurora find <suche>`: Intelligente Suche in Namen und innerhalb von README.md-Dateien.
- `aurora list`: Listet verfügbare oder lokal installierte Pakete auf.
- `aurora update`: Aktualisiert die Projektabhängigkeiten.

## Integration der Standardbibliothek
Der Manager erkennt automatisch den Speicherort der `aurora-austral-standard-lib`, um sicherzustellen, dass alle Pakete korrekt gegen die lokale Version der Standardbibliothek kompiliert werden.

## Lizenz
Apache-2.0
