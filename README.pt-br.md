# Gerenciador de Pacotes Aurora

Um gerenciador de pacotes independente de alto desempenho para a linguagem **Aurora Austral**, projetado com **zero dependências externas**.

## Instalação

```bash
npm install -g @aurora.purecore.codes/latest@1.1.0
```

**Nota:** Este pacote é completamente autossuficiente. Utiliza apenas as APIs nativas do Node.js (`fetch`, `fs`, `path`, `os`, `child_process`).

## Comandos Principais

- `aurora init`: Inicializa um novo projeto e configura o compilador local.
- `aurora install <pacote>`: Baixa, compila e testa um pacote do repositório oficial.
- `aurora find <busca>`: Busca inteligente em nomes e dentro de arquivos README.md.
- `aurora list`: Lista pacotes disponíveis ou instalados localmente.
- `aurora update`: Atualiza as dependências do projeto.

## Integração com Biblioteca Padrão
O gerenciador detecta automaticamente a localização da `aurora-austral-standard-lib` para garantir que todos os pacotes sejam compilados corretamente contra a versão local da biblioteca padrão.

## Licença
Apache-2.0
