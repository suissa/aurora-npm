# Gestionnaire de paquets Aurora

Un gestionnaire de paquets autonome et performant pour le langage **Aurora Austral**, conçu sans **aucune dépendance externe**.

## Installation

```bash
npm install -g @aurora.purecore.codes/latest@1.1.0
```

**Note :** Ce paquet est complètement autonome. Il utilise uniquement les API natives de Node.js (`fetch`, `fs`, `path`, `os`, `child_process`).

## Commandes principales

- `aurora init` : Initialise un nouveau projet et configure le compilateur local.
- `aurora install <paquet>` : Télécharge, compile et teste un paquet du dépôt officiel.
- `aurora find <recherche>` : Recherche intelligente dans les noms et dans les fichiers README.md.
- `aurora list` : Liste les paquets disponibles ou installés localement.
- `aurora update` : Met à jour les dépendances du projet.

## Intégration de la bibliothèque standard
Le gestionnaire détecte automatiquement l'emplacement de `aurora-austral-standard-lib` pour s'assurer que tous les paquets sont compilés correctement par rapport à la version locale de la bibliothèque standard.

## Licence
Apache-2.0
