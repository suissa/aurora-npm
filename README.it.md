# Gestore pacchetti Aurora

Un gestore pacchetti autonomo e ad alte prestazioni per il linguaggio **Aurora Austral**, progettato con **zero dipendenze esterne**.

## Installazione

```bash
npm install -g @aurora.purecore.codes/latest@1.1.0
```

**Nota:** Questo pacchetto è completamente autonomo. Utilizza solo le API native di Node.js (`fetch`, `fs`, `path`, `os`, `child_process`).

## Comandi principali

- `aurora init`: Inizializza un nuovo progetto e configura il compilatore locale.
- `aurora install <pacchetto>`: Scarica, compila e testa un pacchetto dal repository ufficiale.
- `aurora find <ricerca>`: Ricerca intelligente nei nomi e all'interno dei file README.md.
- `aurora list`: Elenca i pacchetti disponibili o installati localmente.
- `aurora update`: Aggiorna le dipendenze del progetto.

## Integrazione con la libreria standard
Il gestore rileva automaticamente la posizione di `aurora-austral-standard-lib` per garantire che tutti i pacchetti siano compilati correttamente rispetto alla versione locale della libreria standard.

## Licenza
Apache-2.0
