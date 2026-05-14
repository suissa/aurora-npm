#!/usr/bin/env node

// Zero-dependency: no require('commander') needed.
const fs = require('fs');
const path = require('path');
const os = require('os');

const CACHE_DIR = path.join(os.homedir(), '.aurora_austral', 'packages');
const BIN_CACHE_DIR = path.join(os.homedir(), '.aurora_austral', 'bin');
const LOCAL_DIR = path.join(process.cwd(), 'aurora_packages');
const LOCAL_BIN_DIR = path.join(process.cwd(), '.aurora', 'bin');
const REPO_OWNER = 'Aurora-Austral';
const REPO_NAME = 'vault';
const COMPILER_REPO_OWNER = 'austral';
const COMPILER_REPO_NAME = 'austral';
const COMPILER_VERSION = 'v0.2.0';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/packages`;

// Ensure directories exist
function ensureDirs() {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    if (!fs.existsSync(BIN_CACHE_DIR)) fs.mkdirSync(BIN_CACHE_DIR, { recursive: true });
}

// Detect platform
function getPlatform() {
    const platform = os.platform();
    const arch = os.arch();
    
    if (platform === 'linux' && arch === 'x64') return 'linux-x64';
    if (platform === 'darwin' && arch === 'x64') return 'darwin-x64';
    if (platform === 'darwin' && arch === 'arm64') return 'darwin-arm64';
    if (platform === 'win32' && arch === 'x64') return 'win32-x64';
    
    throw new Error(`Unsupported platform: ${platform}-${arch}`);
}

// Download file using native fetch
async function downloadFile(url, outputPath) {
    const response = await fetch(url, {
        redirect: 'follow',
        headers: {
            'User-Agent': 'aurora-npm',
            'Accept': 'application/octet-stream'
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPath, buffer);
    
    return outputPath;
}

// Download directory from GitHub API
async function downloadDirectoryFromRepo(owner, repo, repoPath, targetDir) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`;
    const response = await fetch(url, {
        headers: { 'User-Agent': 'aurora-npm' }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch ${repoPath}: ${response.statusText}`);
    }
    
    const items = await response.json();
    
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    
    const downloadPromises = items.map(async (item) => {
        const itemTarget = path.join(targetDir, item.name);
        if (item.type === 'file') {
            const fileResponse = await fetch(item.download_url, {
                headers: { 'User-Agent': 'aurora-npm' }
            });
            if (fileResponse.ok) {
                const arrayBuffer = await fileResponse.arrayBuffer();
                fs.writeFileSync(itemTarget, Buffer.from(arrayBuffer));
            }
        } else if (item.type === 'dir') {
            await downloadDirectoryFromRepo(owner, repo, item.path, itemTarget);
        }
    });
    
    await Promise.all(downloadPromises);
}

// Run command
function runCmd(cmd, cwd, silent = false) {
    let finalCmd = cmd;
    if (process.platform === 'win32') {
        finalCmd = `wsl ${cmd}`;
    }
    
    // Resolve local standard library path (two levels up from cwd's aurora_packages/pkg)
    const stdlibCandidates = [
        path.resolve(__dirname, '..', '..', '..', 'aurora-austral-standard-lib', 'src'),
        path.resolve(process.cwd(), '..', 'aurora-austral-standard-lib', 'src'),
        path.resolve(process.cwd(), '../../aurora-austral-standard-lib/src'),
    ];
    const STDLIB_PATH = stdlibCandidates.find(p => fs.existsSync(p)) || process.env.AUSTRAL_STDLIB || '';
    
    try {
        const { execSync } = require('child_process');
        const output = execSync(finalCmd, { 
            cwd, 
            stdio: silent ? 'pipe' : 'inherit', 
            encoding: 'utf-8',
            env: {
                ...process.env,
                ...(STDLIB_PATH ? { AUSTRAL_STDLIB: STDLIB_PATH } : {})
            }
        });
        return { success: true, message: output };
    } catch (error) {
        return { 
            success: false, 
            message: error.stdout || error.stderr || error.message 
        };
    }
}

// Color output (simple implementation without chalk)
function colorize(color, text) {
    const colors = {
        cyan: '\x1b[36m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        red: '\x1b[31m',
        bold: '\x1b[1m',
        reset: '\x1b[0m'
    };
    return `${colors[color] || ''}${text}${colors.reset}`;
}

// Simple spinner
class Spinner {
    constructor(text) {
        this.text = text;
        this.interval = null;
        this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        this.i = 0;
    }
    
    start() {
        process.stdout.write(`\r${this.frames[this.i]} ${this.text}`);
        this.interval = setInterval(() => {
            this.i = (this.i + 1) % this.frames.length;
            process.stdout.write(`\r${this.frames[this.i]} ${this.text}`);
        }, 80);
    }
    
    succeed(message) {
        clearInterval(this.interval);
        process.stdout.write(`\r${colorize('green', '✔')} ${message}\n`);
    }
    
    fail(message) {
        clearInterval(this.interval);
        process.stdout.write(`\r${colorize('red', '✖')} ${message}\n`);
    }
    
    stop() {
        clearInterval(this.interval);
        process.stdout.write('\r' + ' '.repeat(process.stdout.columns || 80) + '\r');
    }
    
    info(message) {
        clearInterval(this.interval);
        process.stdout.write(`\r${colorize('cyan', 'ℹ')} ${message}\n`);
    }
}

// Partial cleanup
async function partialCleanup(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        if (stats.isFile()) {
            const name = item.toLowerCase();
            const shouldKeep = name.endsWith('.html') || 
                               name.includes('.test') || 
                               name.endsWith('.aui') || 
                               name.endsWith('.aum') || 
                               name === 'makefile';
            if (!shouldKeep) {
                fs.unlinkSync(itemPath);
            }
        }
    }
}

// Recursive directory copy
function copyDirAll(src, dst) {
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const dstPath = path.join(dst, entry.name);
        if (entry.isDirectory()) {
            copyDirAll(srcPath, dstPath);
        } else {
            fs.copyFileSync(srcPath, dstPath);
        }
    }
}

// Cross-device safe move (copy + delete), avoids EXDEV on WSL/Windows
function moveDir(src, dst) {
    copyDirAll(src, dst);
    fs.rmSync(src, { recursive: true, force: true });
}

// Main aurora init command
async function initCommand(options) {
    console.log(colorize('bold', colorize('cyan', '\n🚀 Initializing Aurora project...\n')));
    
    try {
        // Create aurora.json
        const packageJsonPath = path.join(process.cwd(), 'aurora.json');
        
        if (fs.existsSync(packageJsonPath)) {
            console.log(colorize('yellow', '⚠️  aurora.json already exists'));
        } else {
            const packageJson = {
                name: path.basename(process.cwd()),
                version: '0.1.0',
                description: 'Aurora Austral project',
                main: 'src/Main.aum',
                scripts: {
                    build: 'make',
                    test: 'make test',
                    clean: 'make clean'
                },
                dependencies: {},
                devDependencies: {},
                aurora: {
                    compiler: 'local',
                    stdlib: 'local'
                }
            };
            
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            console.log(colorize('green', '✓ Created aurora.json'));
        }
        
        // Create directory structure
        const srcDir = path.join(process.cwd(), 'src');
        const auroraPackagesDir = path.join(process.cwd(), 'aurora_packages');
        const auroraDir = path.join(process.cwd(), '.aurora');
        
        if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir);
        if (!fs.existsSync(auroraPackagesDir)) fs.mkdirSync(auroraPackagesDir);
        if (!fs.existsSync(auroraDir)) fs.mkdirSync(auroraDir);
        
        console.log(colorize('green', '✓ Created project directories'));
        
        // Download compiler binary if requested
        if (options.binary !== false) {
            ensureDirs();
            
            try {
                const platform = getPlatform();
                const binName = platform.startsWith('win') ? 'austral.exe' : 'austral';
                
                const assetMap = {
                    'linux-x64': 'austral-linux',
                    'darwin-x64': 'austral-macos',
                    'darwin-arm64': 'austral-macos',
                    'win32-x64': 'austral-windows.exe'
                };
                
                const assetName = assetMap[platform];
                if (!assetName) {
                    throw new Error(`No binary available for platform ${platform}`);
                }
                
                const downloadUrl = `https://github.com/${COMPILER_REPO_OWNER}/${COMPILER_REPO_NAME}/releases/download/${COMPILER_VERSION}/${assetName}`;
                
                const spinner = new Spinner(`Downloading ${assetName} from ${COMPILER_VERSION}...`);
                spinner.start();
                
                const binPath = path.join(BIN_CACHE_DIR, binName);
                await downloadFile(downloadUrl, binPath);
                fs.chmodSync(binPath, 0o755);
                
                spinner.succeed(`Compiler ${COMPILER_VERSION} downloaded: ${binPath}`);
                
                // Copy to local .aurora/bin
                const localBinDir = path.join(process.cwd(), '.aurora', 'bin');
                if (!fs.existsSync(localBinDir)) fs.mkdirSync(localBinDir);
                const localBinPath = path.join(localBinDir, binName);
                fs.copyFileSync(binPath, localBinPath);
                fs.chmodSync(localBinPath, 0o755);
                
                console.log(colorize('green', `✓ Compiler installed: ${localBinPath}`));
                
                // Test if binary works
                const testSpinner = new Spinner('Testing compiler binary...');
                testSpinner.start();
                
                const testResult = runCmd(`${localBinPath} --version`, process.cwd(), true);
                
                if (!testResult.success) {
                    testSpinner.fail('Downloaded binary cannot execute (likely Nix-compiled)');
                    console.log(colorize('yellow', '⚠️  The official release binary has Nix dependencies'));
                    console.log(colorize('yellow', '   Falling back to system compiler'));
                    console.log(colorize('yellow', '   Please ensure "austral" is in your PATH'));
                    
                    fs.unlinkSync(localBinPath);
                    
                    const config = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                    config.aurora.compiler = 'system';
                    config.aurora.note = 'Using system-installed austral compiler';
                    fs.writeFileSync(packageJsonPath, JSON.stringify(config, null, 2));
                } else {
                    testSpinner.succeed('Compiler binary works!');
                }
                
                // stdlib download removed — we use the local aurora-austral-standard-lib
                
                // Update aurora.json
                const config = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                if (testResult.success) {
                    config.aurora.compiler = 'local';
                    config.aurora.compilerPath = `.aurora/bin/${binName}`;
                } else {
                    config.aurora.compiler = 'system';
                    config.aurora.note = 'Using system-installed austral compiler';
                }
                config.aurora.stdlibPath = 'local:aurora-austral-standard-lib/src';
                fs.writeFileSync(packageJsonPath, JSON.stringify(config, null, 2));
                
            } catch (error) {
                console.log(colorize('yellow', `⚠️  Could not download binaries: ${error.message}`));
                console.log(colorize('yellow', '   You can install the compiler manually or use system installation'));
            }
        }
        
        // Create example files
        const mainAui = path.join(srcDir, 'Main.aui');
        if (!fs.existsSync(mainAui)) {
            fs.writeFileSync(mainAui, `module Example.Main is
    function main(): ExitCode;
end module.
`);
            console.log(colorize('green', '✓ Created src/Main.aui'));
        }
        
        const mainAum = path.join(srcDir, 'Main.aum');
        if (!fs.existsSync(mainAum)) {
            fs.writeFileSync(mainAum, `module body Example.Main is
    function main(): ExitCode is
        printLn("Hello, Aurora Austral!");
        return ExitSuccess();
    end;
end module body.
`);
            console.log(colorize('green', '✓ Created src/Main.aum'));
        }
        
        // Create Makefile
        const makefilePath = path.join(process.cwd(), 'Makefile');
        if (!fs.existsSync(makefilePath)) {
            const makefile = `# Aurora Austral Project Makefile

# Detect compiler - excluding broken Nix binaries in .local/bin
AU_COMPILER := $(shell \\
	if [ -x ".aurora/bin/austral" ]; then \\
		echo ".aurora/bin/austral"; \\
	else \\
		for path in $$(echo $$PATH | tr ':' ' '); do \\
			if [ -x "$$path/austral" ] && echo "$$path" | grep -qv "/.local/bin"; then \\
				echo "$$path/austral"; \\
				break; \\
			fi; \\
		done; \\
	fi)

ifeq ($(AU_COMPILER),)
    $(error Austral compiler not found. Please install austral in /usr/local/bin)
endif

# Detect stdlib
ifneq ($(wildcard .aurora/stdlib),)
    AUSTRAL_STDLIB = .aurora/stdlib
else ifneq ($(wildcard /usr/local/lib/austral/standard/src),)
    AUSTRAL_STDLIB = /usr/local/lib/austral/standard/src
else ifneq ($(wildcard /usr/lib/austral/standard/src),)
    AUSTRAL_STDLIB = /usr/lib/austral/standard/src
else
    $(error AUSTRAL_STDLIB not found. Please set AUSTRAL_STDLIB environment variable)
endif

# Standard library modules
STDLIB := \\
	$(AUSTRAL_STDLIB)/Tuples.aui,$(AUSTRAL_STDLIB)/Tuples.aum \\
	$(AUSTRAL_STDLIB)/Bounded.aui,$(AUSTRAL_STDLIB)/Bounded.aum \\
	$(AUSTRAL_STDLIB)/Equality.aui,$(AUSTRAL_STDLIB)/Equality.aum \\
	$(AUSTRAL_STDLIB)/Order.aui,$(AUSTRAL_STDLIB)/Order.aum \\
	$(AUSTRAL_STDLIB)/Box.aui,$(AUSTRAL_STDLIB)/Box.aum \\
	$(AUSTRAL_STDLIB)/Buffer.aui,$(AUSTRAL_STDLIB)/Buffer.aum \\
	$(AUSTRAL_STDLIB)/String.aui,$(AUSTRAL_STDLIB)/String.aum \\
	$(AUSTRAL_STDLIB)/StringBuilder.aui,$(AUSTRAL_STDLIB)/StringBuilder.aum \\
	$(AUSTRAL_STDLIB)/IO/IO.aui,$(AUSTRAL_STDLIB)/IO/IO.aum \\
	$(AUSTRAL_STDLIB)/IO/Terminal.aui,$(AUSTRAL_STDLIB)/IO/Terminal.aum

SRC := src/Main.aui,src/Main.aum
ENTRY := Example.Main:main
OUTPUT := main

all: build

build:
	@echo "Building project..."
	@echo "Using compiler: $(AU_COMPILER)"
	@echo "Using stdlib: $(AUSTRAL_STDLIB)"
	$(AU_COMPILER) compile $(STDLIB) $(SRC) --entrypoint=$(ENTRY) --output=$(OUTPUT)
	@echo "Build successful!"

run: build
	./$(OUTPUT)

test:
	@echo "No tests defined yet"

clean:
	rm -f $(OUTPUT) calltree.html error.html

.PHONY: all build run test clean
`;
            fs.writeFileSync(makefilePath, makefile);
            console.log(colorize('green', '✓ Created Makefile'));
        }
        
        // Create .gitignore
        const gitignorePath = path.join(process.cwd(), '.gitignore');
        if (!fs.existsSync(gitignorePath)) {
            fs.writeFileSync(gitignorePath, `# Aurora Austral
aurora_packages/
.aurora/bin/
.aurora/stdlib/
main
*.o
calltree.html
error.html

# OS
.DS_Store
Thumbs.db
`);
            console.log(colorize('green', '✓ Created .gitignore'));
        }
        
        console.log(colorize('bold', colorize('green', '\n✨ Project initialized successfully!\n')));
        console.log(colorize('cyan', 'Next steps:'));
        console.log(colorize('white', '  1. Edit src/Main.aum'));
        console.log(colorize('white', '  2. Run: make build'));
        console.log(colorize('white', '  3. Run: ./main'));
        console.log(colorize('white', '  4. Install packages: aurora install <package-name>\n'));
        
    } catch (error) {
        console.log(colorize('red', `\n✖ Error initializing project: ${error.message}`));
        process.exit(1);
    }
}

// Install package command
async function installPackage(packageName) {
    ensureDirs();
    const spinner = new Spinner(`Checking for ${packageName}...`);

    const cachePath = path.join(CACHE_DIR, packageName);
    const localPath = path.join(LOCAL_DIR, packageName);

    try {
        if (fs.existsSync(cachePath)) {
            spinner.text = `Using cached version of ${packageName}...`;
            if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR);
            if (fs.existsSync(localPath)) fs.rmSync(localPath, { recursive: true, force: true });
            moveDir(cachePath, localPath); // cross-device safe
            spinner.succeed(`Package ${packageName} installed from cache.`);
            return;
        }

        spinner.text = `Downloading ${packageName} from GitHub...`;
        if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR);
        if (fs.existsSync(localPath)) fs.rmSync(localPath, { recursive: true, force: true });
        await downloadDirectoryFromRepo(REPO_OWNER, REPO_NAME, `packages/${packageName}`, localPath);

        spinner.stop();
        console.log(colorize('blue', `\n--- Building ${packageName} ---`));
        const buildRes = runCmd('make', localPath, false);
        if (!buildRes.success) {
            await partialCleanup(localPath);
            console.log(colorize('red', `\n✖ Build failed for ${packageName}`));
            process.exit(1);
        }

        console.log(colorize('blue', `\n--- Testing ${packageName} ---`));
        const testRes = runCmd('make test', localPath, false);
        if (!testRes.success) {
            await partialCleanup(localPath);
            console.log(colorize('red', `\n✖ Test failed for ${packageName}`));
            process.exit(1);
        }

        spinner.start(`Caching ${packageName}...`);
        // Copy to cache but KEEP in aurora_packages/ so the Austral compiler can find the .aui/.aum files
        if (fs.existsSync(cachePath)) fs.rmSync(cachePath, { recursive: true, force: true });
        copyDirAll(localPath, cachePath);

        spinner.succeed(`Package ${packageName} installed successfully.`);
        console.log(colorize('cyan', `  → Files available at: aurora_packages/${packageName}`));
    } catch (error) {
        spinner.fail(`Error installing ${packageName}: ${error.message}`);
        if (fs.existsSync(localPath)) await partialCleanup(localPath);
        process.exit(1);
    }
}

// List packages command
async function listPackages(options) {
    const spinner = new Spinner('Fetching list...');
    try {
        if (options.local) {
            ensureDirs();
            const files = fs.readdirSync(CACHE_DIR);
            spinner.stop();
            console.log(colorize('bold', 'Local cached packages (~/.aurora_austral/packages):'));
            if (files.length === 0) console.log(' (none)');
            files.forEach(f => console.log(` - ${f}`));
        } else {
            const response = await fetch(API_URL, { headers: { 'User-Agent': 'aurora-npm' } });
            if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
            const items = await response.json();
            const packages = items.filter(item => item.type === 'dir').map(item => item.name);
            spinner.stop();
            console.log(colorize('bold', 'Remote packages (GitHub):'));
            packages.forEach(p => console.log(` - ${p}`));
        }
    } catch (error) {
        spinner.fail(`Error: ${error.message}`);
    }
}

async function findPackage(query) {
    const spinner = new Spinner(`Searching for "${query}" in names and READMEs...`);
    spinner.start();
    try {
        const response = await fetch(API_URL, { headers: { 'User-Agent': 'aurora-npm' } });
        if (!response.ok) throw new Error(`Failed to fetch package list: ${response.statusText}`);
        const items = await response.json();
        const packageDirs = items.filter(item => item.type === 'dir');

        const searchResults = await Promise.all(packageDirs.map(async (dir) => {
            const name = dir.name;
            const lowerQuery = query.toLowerCase();
            
            // Match by name
            if (name.toLowerCase().includes(lowerQuery)) {
                return { name, match: 'name' };
            }

            // Match by README content
            try {
                // We use raw.githubusercontent.com to get the file content directly
                const readmeUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/packages/${name}/README.md`;
                const readmeRes = await fetch(readmeUrl);
                if (readmeRes.ok) {
                    const content = await readmeRes.text();
                    if (content.toLowerCase().includes(lowerQuery)) {
                        return { name, match: 'readme' };
                    }
                }
            } catch (e) {
                // Ignore README errors
            }
            return null;
        }));

        const filtered = searchResults.filter(r => r !== null);
        
        spinner.stop();
        if (filtered.length > 0) {
            console.log(colorize('bold', `\nFound ${filtered.length} packages matching "${query}":`));
            filtered.forEach(p => {
                const reason = p.match === 'readme' ? colorize('cyan', ' (found in README)') : '';
                console.log(` - ${colorize('green', p.name)}${reason}`);
            });
            console.log('');
        } else {
            console.log(colorize('yellow', `\nNo packages found matching "${query}".`));
        }
    } catch (error) {
        spinner.fail(`Error: ${error.message}`);
    }
}

// Uninstall package command
async function uninstallPackage(packageName) {
    const spinner = new Spinner(`Uninstalling ${packageName}...`);
    try {
        const localPath = path.join(LOCAL_DIR, packageName);
        const cachePath = path.join(CACHE_DIR, packageName);

        let removed = false;
        if (fs.existsSync(localPath)) {
            fs.rmSync(localPath, { recursive: true, force: true });
            removed = true;
        }
        if (fs.existsSync(cachePath)) {
            fs.rmSync(cachePath, { recursive: true, force: true });
            removed = true;
        }

        if (removed) {
            spinner.succeed(`Package ${packageName} removed from local and cache.`);
        } else {
            spinner.info(`Package ${packageName} was not found.`);
        }
    } catch (error) {
        spinner.fail(`Error uninstalling ${packageName}: ${error.message}`);
    }
}

// Test package command
async function testPackage(packageName) {
    const localPath = path.join(LOCAL_DIR, packageName);
    if (!fs.existsSync(localPath)) {
        console.log(colorize('red', `Package ${packageName} is not installed in aurora_packages/.`));
        return;
    }

    console.log(colorize('blue', `Running "make test" in ${localPath}...`));
    const res = runCmd('make test', localPath);
    if (res.success) {
        console.log(colorize('green', `Tests passed for ${packageName}.`));
    } else {
        console.log(colorize('red', `Tests failed for ${packageName}.`));
        console.log(res.message);
    }
}

// Update package command
async function updatePackage(packageName) {
    ensureDirs();
    const packagesToUpdate = [];

    if (packageName) {
        packagesToUpdate.push(packageName);
    } else {
        if (fs.existsSync(LOCAL_DIR)) {
            packagesToUpdate.push(...fs.readdirSync(LOCAL_DIR));
        }
        if (fs.existsSync(CACHE_DIR)) {
            packagesToUpdate.push(...fs.readdirSync(CACHE_DIR));
        }
    }

    const uniquePackages = [...new Set(packagesToUpdate)];
    if (uniquePackages.length === 0) {
        console.log(colorize('yellow', 'No packages found to update.'));
        return;
    }

    for (const pkg of uniquePackages) {
        const spinner = new Spinner(`Updating ${pkg}...`);
        try {
            const localPath = path.join(LOCAL_DIR, pkg);
            const cachePath = path.join(CACHE_DIR, pkg);

            spinner.text = `Downloading latest ${pkg}...`;
            const tempDir = path.join(os.tmpdir(), `aurora-update-${pkg}-${Date.now()}`);
            await downloadDirectoryFromRepo(REPO_OWNER, REPO_NAME, `packages/${pkg}`, tempDir);

            spinner.stop();
            console.log(colorize('blue', `\n--- Building ${pkg} ---`));
            const buildRes = runCmd('make', tempDir, false);
            if (!buildRes.success) {
                console.log(colorize('red', `\n✖ Update failed for ${pkg} (build error)`));
                fs.rmSync(tempDir, { recursive: true, force: true });
                continue;
            }

            console.log(colorize('blue', `\n--- Testing ${pkg} ---`));
            const testRes = runCmd('make test', tempDir, false);
            if (!testRes.success) {
                console.log(colorize('red', `\n✖ Update failed for ${pkg} (test error)`));
                fs.rmSync(tempDir, { recursive: true, force: true });
                continue;
            }

            spinner.start(`Updating ${pkg}...`);

            if (fs.existsSync(localPath)) {
                fs.rmSync(localPath, { recursive: true, force: true });
            }
            moveDir(tempDir, localPath);
            
            if (fs.existsSync(cachePath)) {
                fs.rmSync(cachePath, { recursive: true, force: true });
            }
            copyDirAll(localPath, cachePath);
            
            spinner.succeed(`Package ${pkg} updated.`);
        } catch (error) {
            spinner.fail(`Error updating ${pkg}: ${error.message}`);
        }
    }
}

// ── Native CLI parser (zero dependencies) ────────────────────────────────────
const args = process.argv.slice(2);
const command = args[0];
const flags = new Set(args.filter(a => a.startsWith('--')));
const positional = args.filter(a => !a.startsWith('--'));

function printHelp() {
    console.log(`
  ${colorize('bold', colorize('cyan', 'aurora'))} - Aurora Austral Package Manager v0.1.0

  ${colorize('bold', 'Usage:')}
    aurora <command> [options]

  ${colorize('bold', 'Commands:')}
    init                     Initialize a new Aurora project
    install <package>        Install a package from the vault
    list [--local]           List remote (or local) packages
    find <name>              Search for a package
    uninstall <package>      Remove a package
    test <package>           Run tests for an installed package
    update [package]         Update one or all packages

  ${colorize('bold', 'Options:')}
    --no-binary              (init) Skip downloading compiler binary
    --local                  (list) List locally cached packages
    --help, -h               Show this help message
    --version, -v            Show version
`);
}

(async () => {
    if (!command || command === '--help' || command === '-h') {
        printHelp();
        process.exit(0);
    }
    if (command === '--version' || command === '-v') {
        console.log('aurora 0.1.0');
        process.exit(0);
    }

    switch (command) {
        case 'init':
            await initCommand({ binary: !flags.has('--no-binary') });
            break;
        case 'install':
            if (!positional[1]) { console.log(colorize('red', 'Usage: aurora install <package-name>')); process.exit(1); }
            await installPackage(positional[1]);
            break;
        case 'list':
            await listPackages({ local: flags.has('--local') });
            break;
        case 'find':
            if (!positional[1]) { console.log(colorize('red', 'Usage: aurora find <package-name>')); process.exit(1); }
            await findPackage(positional[1]);
            break;
        case 'uninstall':
            if (!positional[1]) { console.log(colorize('red', 'Usage: aurora uninstall <package-name>')); process.exit(1); }
            await uninstallPackage(positional[1]);
            break;
        case 'test':
            if (!positional[1]) { console.log(colorize('red', 'Usage: aurora test <package-name>')); process.exit(1); }
            await testPackage(positional[1]);
            break;
        case 'update':
            await updatePackage(positional[1] || null);
            break;
        default:
            console.log(colorize('red', `Unknown command: ${command}`));
            printHelp();
            process.exit(1);
    }
})();
