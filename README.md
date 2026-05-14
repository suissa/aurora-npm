# Aurora Package Manager

Gerenciador de pacotes para a linguagem Aurora Austral **sem dependências externas**.

## Instalação

```bash
npm install -g @aurora.purecore.codes/latest@1.0.0
```

**Nota:** Este package não tem dependências externas. Usa apenas o Node.js nativo (fetch, fs, path, os, child_process).

## Requisitos

- Node.js >= 18.0.0 (para suporte nativo a `fetch`)
- WSL (opcional, para Windows)

## Comandos

### `aurora init`

Inicializa um novo projeto Aurora Austral com estrutura completa:

```bash
aurora init
```

O que faz:
- ✅ Cria `aurora.json` com configuração do projeto
- ✅ Cria estrutura de diretórios (`src/`, `aurora_packages/`, `.aurora/`)
- ✅ **Baixa binário do compilador** para a plataforma atual
- ✅ **Baixa biblioteca padrão**
- ✅ Cria arquivos de exemplo (`src/Main.aui`, `src/Main.aum`)
- ✅ Cria `Makefile` configurado
- ✅ Cria `.gitignore`

**Opções:**
- `--no-binary`: Não baixa binários (usa instalação do sistema)

**Exemplo:**
```bash
mkdir meu-projeto
cd meu-projeto
aurora init

# Compilar e executar
make build
./main
```

### `aurora install <package>`

Instala um pacote do repositório:

```bash
aurora install dpop-token
```

O que faz:
- Baixa o pacote do GitHub
- Compila o pacote
- Executa testes
- Salva em cache local

### `aurora list`

Lista pacotes disponíveis:

```bash
# Listar pacotes remotos
aurora list

# Listar pacotes em cache local
aurora list --local
```

### `aurora find <nome>`

Busca pacotes por nome:

```bash
aurora find dpop
```

### `aurora uninstall <package>`

Remove um pacote:

```bash
aurora uninstall dpop-token
```

### `aurora update [package]`

Atualiza pacotes:

```bash
# Atualizar todos os pacotes
aurora update

# Atualizar pacote específico
aurora update dpop-token
```

### `aurora test <package>`

Executa testes de um pacote:

```bash
aurora test dpop-token
```

## Estrutura de Projeto

Após `aurora init`:

```
meu-projeto/
├── aurora.json              # Configuração do projeto
├── Makefile                 # Build configuration
├── .gitignore              # Git ignore
├── src/
│   ├── Main.aui            # Interface do módulo principal
│   └── Main.aum            # Implementação do módulo principal
├── aurora_packages/        # Pacotes instalados
└── .aurora/
    ├── bin/
    │   └── austral         # Compilador (baixado automaticamente)
    └── stdlib/             # Biblioteca padrão (baixada automaticamente)
```

## aurora.json

Arquivo de configuração do projeto:

```json
{
  "name": "meu-projeto",
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
    "stdlibPath": ".aurora/stdlib"
  }
}
```

## Binários Pré-compilados

O comando `aurora init` baixa automaticamente binários pré-compilados para:

- **Linux x64** (`linux-x64`)
- **macOS x64** (`darwin-x64`)
- **macOS ARM64** (`darwin-arm64` - M1/M2)
- **Windows x64** (`win32-x64`)

Os binários são baixados do GitHub Releases e salvos em:
- Cache global: `~/.aurora_austral/bin/`
- Projeto local: `.aurora/bin/`

## Workflow Típico

### 1. Criar Novo Projeto

```bash
mkdir meu-app
cd meu-app
aurora init
```

### 2. Desenvolver

Edite `src/Main.aum`:

```austral
module body Example.Main is
    function main(): ExitCode is
        printLn("Hello, Aurora!");
        printLn("A language with linear types!");
        return ExitSuccess();
    end;
end module body.
```

### 3. Instalar Dependências

```bash
aurora install dpop-token
aurora install http-client
```

### 4. Compilar e Executar

```bash
make build
./main
```

### 5. Testar

```bash
make test
```

## Sem Binários Pré-compilados

Se preferir usar uma instalação manual do compilador:

```bash
# Inicializar sem baixar binários
aurora init --no-binary

# O Makefile usará 'austral' do PATH do sistema
make build
```

## Cache

Os pacotes e binários são salvos em cache:

```
~/.aurora_austral/
├── packages/          # Pacotes instalados
└── bin/              # Binários do compilador
    ├── austral       # Compilador
    └── stdlib/       # Biblioteca padrão
```

## Desenvolvimento

### Compilar Binários para Release

```bash
cd @aurora.purecore.codes/latest@1.0.0
./scripts/build-release.sh 0.2.0
```

Isso cria:
- `releases/austral-<platform>-<arch>` - Binário compilado
- `releases/austral-<platform>-<arch>.sha256` - Checksum
- `releases/stdlib-v0.2.0/` - Biblioteca padrão
- `releases/release-info-v0.2.0.txt` - Informações do release

### Fazer Release no GitHub

```bash
# Criar tag
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0

# Criar release com binários
gh release create v0.2.0 \
  releases/austral-linux-x64 \
  releases/austral-darwin-x64 \
  releases/austral-darwin-arm64 \
  releases/austral-win32-x64.exe \
  --title "Aurora Austral v0.2.0" \
  --notes "Compiled binaries for multiple platforms"
```

Veja [BINARY_RELEASE.md](BINARY_RELEASE.md) para mais detalhes.

## Plataformas Suportadas

### Compilador
- Linux x64
- macOS x64 (Intel)
- macOS ARM64 (Apple Silicon)
- Windows x64 (via WSL)

### Package Manager
- Linux
- macOS
- Windows (com WSL)

## Troubleshooting

### Binário não executa

**Linux/macOS:**
```bash
chmod +x .aurora/bin/austral
./.aurora/bin/austral --version
```

**Windows:**
- Certifique-se de que o WSL está instalado
- O comando `make` será executado via WSL automaticamente

### Erro "AUSTRAL_STDLIB not found"

```bash
# Baixar stdlib manualmente
aurora init --no-binary
# Ou definir variável de ambiente
export AUSTRAL_STDLIB=/usr/local/lib/austral/standard/src
```

### Pacote não compila

```bash
# Limpar cache e reinstalar
aurora uninstall <package>
rm -rf ~/.aurora_austral/packages/<package>
aurora install <package>
```

## Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## Licença

Apache-2.0

## Links

- [Aurora Austral](https://github.com/austral/austral)
- [Package Vault](https://github.com/Aurora-Austral/vault)
- [Documentação](https://austral-lang.org/)
