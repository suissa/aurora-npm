# Gestor de paquetes Aurora

Un gestor de paquetes independiente y de alto rendimiento para el lenguaje **Aurora Austral**, diseñado con **cero dependencias externas**.

## Instalación

```bash
npm install -g @aurora.purecore.codes/latest@1.1.0
```

**Nota:** Este paquete es completamente autónomo. Utiliza únicamente las APIs nativas de Node.js (`fetch`, `fs`, `path`, `os`, `child_process`).

## Comandos Principales

- `aurora init`: Inicializa un nuevo proyecto y configura el compilador local.
- `aurora install <paquete>`: Descarga, compila y prueba un paquete del repositorio oficial.
- `aurora find <consulta>`: Búsqueda inteligente en nombres y dentro de los archivos README.md.
- `aurora list`: Lista los paquetes disponibles o instalados localmente.
- `aurora update`: Actualiza las dependencias del proyecto.

## Integración con Biblioteca Estándar
El gestor detecta automáticamente la ubicación de `aurora-austral-standard-lib` para garantizar que todos los paquetes se compilen correctamente contra la versión local de la biblioteca estándar.

## Licencia
Apache-2.0
