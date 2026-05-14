# Aurora Austral - Quick Start Guide

Get started with Aurora Austral in 5 minutes! 🚀

## Installation

```bash
npm install -g @aurora.purecore.codes/latest
```

## Create Your First Project

```bash
# 1. Create project directory
mkdir hello-aurora
cd hello-aurora

# 2. Initialize project (downloads compiler automatically)
aurora init

# 3. Build and run
make build
./main
```

**Output:**
```
Hello, Aurora Austral!
```

That's it! You now have a working Aurora Austral project. 🎉

## What Just Happened?

The `aurora init` command:

1. ✅ Downloaded the Austral compiler binary for your platform
2. ✅ Downloaded the standard library
3. ✅ Created project structure with example code
4. ✅ Generated a Makefile for easy building
5. ✅ Set up `.gitignore` for version control

## Project Structure

```
hello-aurora/
├── aurora.json          # Project configuration
├── Makefile            # Build configuration
├── src/
│   ├── Main.aui        # Module interface
│   └── Main.aum        # Module implementation
├── .aurora/
│   ├── bin/austral     # Compiler (downloaded)
│   └── stdlib/         # Standard library (downloaded)
└── aurora_packages/    # Installed packages
```

## Next Steps

### 1. Edit Your Code

Open `src/Main.aum` and modify it:

```austral
module body Example.Main is
    function main(): ExitCode is
        printLn("Welcome to Aurora Austral!");
        printLn("A language with linear types!");
        return ExitSuccess();
    end;
end module body.
```

### 2. Rebuild and Run

```bash
make build
./main
```

### 3. Install Packages

```bash
# List available packages
aurora list

# Install a package
aurora install dpop-token

# Use it in your code
```

### 4. Use Installed Packages

Edit `src/Main.aui`:

```austral
module Example.Main is
    import DpopToken (
        generateToken,
        TokenConfig
    );
    
    function main(): ExitCode;
end module.
```

Edit `src/Main.aum`:

```austral
module body Example.Main is
    function main(): ExitCode is
        let config: TokenConfig := makeTokenConfig();
        let token: String := generateToken(config);
        printLn(token);
        return ExitSuccess();
    end;
end module body.
```

## Common Commands

```bash
# Initialize new project
aurora init

# Install package
aurora install <package-name>

# List available packages
aurora list

# Search for packages
aurora find <search-term>

# Update packages
aurora update

# Build project
make build

# Run project
./main

# Clean build artifacts
make clean
```

## Platform Support

Aurora init automatically detects your platform and downloads the correct binary:

- ✅ **Linux x64** - Native support
- ✅ **macOS Intel** - Native support
- ✅ **macOS Apple Silicon** - Native support (M1/M2/M3)
- ✅ **Windows x64** - Via WSL

## Without Binary Download

If you prefer to install the compiler manually:

```bash
# Initialize without downloading binaries
aurora init --no-binary

# Make sure 'austral' is in your PATH
which austral

# Build normally
make build
```

## VSCode Extension

For the best development experience, install the Aurora Austral VSCode extension:

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Aurora Austral"
4. Install

**Features:**
- Syntax highlighting
- Code snippets
- Package validation
- One-click package installation
- Error detection

## Example Projects

### Hello World

```austral
module body Example.Main is
    function main(): ExitCode is
        printLn("Hello, World!");
        return ExitSuccess();
    end;
end module body.
```

### String Manipulation

```austral
module body Example.Main is
    function main(): ExitCode is
        let name: String := "Aurora";
        let greeting: String := concat("Hello, ", name);
        printLn(greeting);
        return ExitSuccess();
    end;
end module body.
```

### Using Standard Library

```austral
module body Example.Main is
    import Austral.String (
        concat,
        length
    );
    
    function main(): ExitCode is
        let text: String := "Aurora Austral";
        let len: Nat64 := length(text);
        printLn(concat("Length: ", intToString(len)));
        return ExitSuccess();
    end;
end module body.
```

## Troubleshooting

### "austral: command not found"

**Solution:** Run `aurora init` again - it will download the compiler.

### "Permission denied" when running ./main

**Solution:**
```bash
chmod +x .aurora/bin/austral
chmod +x main
```

### Build fails with "AUSTRAL_STDLIB not found"

**Solution:** The stdlib wasn't downloaded. Run:
```bash
aurora init
```

### Package installation fails

**Solution:**
```bash
# Clear cache and retry
aurora uninstall <package-name>
rm -rf ~/.aurora_austral/packages/<package-name>
aurora install <package-name>
```

## Learning Resources

- **Official Docs**: https://austral-lang.org/
- **Tutorial**: https://austral-lang.org/tutorial/
- **Specification**: https://austral-lang.org/spec/
- **Examples**: Check `examples/` in the compiler repository

## Key Concepts

### Linear Types

Aurora Austral uses linear types for memory safety:

```austral
-- Each value must be used exactly once
let x: String := "Hello";
consume(x);  -- x is now consumed
-- Cannot use x again!
```

### Module System

Every file has an interface (`.aui`) and implementation (`.aum`):

```austral
-- Main.aui (interface)
module Example.Main is
    function greet(name: String): String;
end module.

-- Main.aum (implementation)
module body Example.Main is
    function greet(name: String): String is
        return concat("Hello, ", name);
    end;
end module body.
```

### Memory Safety

No garbage collection, no manual memory management:

```austral
-- Compiler tracks ownership and lifetime
let buffer: Buffer := makeBuffer(1024);
writeToBuffer(buffer, "data");
-- buffer is automatically freed when out of scope
```

## Getting Help

- **GitHub Issues**: https://github.com/austral/austral/issues
- **Discussions**: https://github.com/austral/austral/discussions
- **Package Manager Issues**: https://github.com/Aurora-Austral/aurora-npm/issues

## What's Next?

1. ✅ Read the [Tutorial](https://austral-lang.org/tutorial/)
2. ✅ Explore [Examples](https://github.com/austral/austral/tree/master/examples)
3. ✅ Install the [VSCode Extension](vscode:extension/aurora-austral)
4. ✅ Join the [Community](https://github.com/austral/austral/discussions)
5. ✅ Build something awesome!

## Summary

```bash
# Complete workflow in 4 commands:
mkdir my-project && cd my-project  # 1. Create directory
aurora init                         # 2. Initialize project
make build                          # 3. Build
./main                              # 4. Run
```

Welcome to Aurora Austral! 🎉

---

**Need more details?** Check out:
- [README.md](README.md) - Full documentation
- [BINARY_RELEASE.md](BINARY_RELEASE.md) - Binary compilation guide
- [TEST_INIT_COMMAND.md](TEST_INIT_COMMAND.md) - Testing guide
