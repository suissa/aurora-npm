# Aurora Package Manager

A high-performance, standalone package manager for the **Aurora Austral** language, designed with **zero external dependencies**.

## Installation

```bash
npm install -g @aurora.purecore.codes/latest@1.1.0
```

**Note:** This package is completely self-contained. It uses native Node.js APIs only (`fetch`, `fs`, `path`, `os`, `child_process`), so you don't even need to run `npm install` inside the project folder.

## Requirements

- **Node.js >= 18.0.0** (required for native `fetch` support)
- **WSL** (recommended for Windows users)

## Commands

### `aurora init`

Initialize a new Aurora Austral project with a complete structure:

```bash
aurora init
```

**What it does:**
- ✅ Creates `aurora.json` project configuration.
- ✅ Sets up the directory structure (`src/`, `aurora_packages/`, `.aurora/`).
- ✅ **Downloads the compiler binary** for your current platform.
- ✅ Configures the project to use the **local standard library** (detected automatically).
- ✅ Creates boilerplate files (`src/Main.aui`, `src/Main.aum`).
- ✅ Generates a pre-configured `Makefile`.
- ✅ Creates a `.gitignore` file.

**Options:**
- `--no-binary`: Skip downloading binaries (uses the system's `austral` compiler instead).

### `aurora install <package>`

Install a package from the official Vault repository:

```bash
aurora install dpop-token
```

**Workflow:**
1. Downloads the package from GitHub.
2. Compiles the package locally.
3. Runs the package's internal tests.
4. **Caches** the package globally for future use.
5. Keeps a copy in `aurora_packages/` for your project to use.

### `aurora list`

List available packages:

```bash
# List remote packages in the Vault
aurora list

# List locally cached packages
aurora list --local
```

### `aurora find <query>`

Search for packages with an intelligent matching system:

```bash
aurora find dpop
```

**How it works:**
- Searches for the `<query>` in **package names**.
- Performs a deep search inside the **README.md** files of every package in the repository.
- Highlights if the match was found inside a README for better context.

### `aurora uninstall <package>`

Remove a package from both your project and the local cache:

```bash
aurora uninstall dpop-token
```

### `aurora update [package]`

Update your project dependencies:

```bash
# Update all installed packages
aurora update

# Update a specific package
aurora update dpop-token
```

---

## Project Structure

A typical project initialized with `aurora init` looks like this:

```
my-project/
├── aurora.json              # Project configuration
├── Makefile                 # Build automation script
├── .gitignore               # Git exclusion rules
├── src/
│   ├── Main.aui            # Main module interface
│   └── Main.aum            # Main module implementation
├── aurora_packages/        # Installed dependencies
└── .aurora/
    └── bin/
        └── austral         # Downloaded compiler binary
```

---

## aurora.json

The project's heart, containing build and dependency settings:

```json
{
  "name": "my-project",
  "version": "0.1.0",
  "description": "Aurora Austral project",
  "main": "src/Main.aum",
  "scripts": {
    "build": "make",
    "test": "make test",
    "clean": "make clean"
  },
  "dependencies": {},
  "devDependencies": {},
  "aurora": {
    "compiler": "local",
    "compilerPath": ".aurora/bin/austral",
    "stdlibPath": "local:aurora-austral-standard-lib/src"
  }
}
```

---

## Technical Details

### Cross-Device Compatibility
The manager uses a custom `moveDir` implementation that safely handles file transfers across different filesystems (e.g., moving files from a Windows `/mnt/d/` drive to a WSL `/home/` directory), avoiding the common `EXDEV` error.

### Local Standard Library Integration
The manager is designed to work seamlessly with the `aurora-austral-standard-lib`. It automatically detects the library's location in sibling directories or uses the `AUSTRAL_STDLIB` environment variable to ensure all your packages compile against the correct version of the standard library.

---

## Supported Platforms

### Compiler Binaries
- **Linux x64**
- **macOS x64** (Intel)
- **macOS ARM64** (Apple Silicon)
- **Windows x64** (via WSL)

### Package Manager
- **Linux**
- **macOS**
- **Windows** (via WSL/Bash)

---

## Troubleshooting

### Binary Execution Issues
If the downloaded binary doesn't run on Linux/macOS:
```bash
chmod +x .aurora/bin/austral
./.aurora/bin/austral --version
```

### "AUSTRAL_STDLIB not found"
Ensure the `aurora-austral-standard-lib` is located in the parent directory of your project, or set the environment variable:
```bash
export AUSTRAL_STDLIB=/path/to/your/stdlib/src
```

---

## License

Licensed under the **Apache-2.0 License**.

## Links

- [Aurora Austral Compiler](https://github.com/austral/austral)
- [Package Vault](https://github.com/Aurora-Austral/vault)
- [Official Documentation](https://austral-lang.org/)
