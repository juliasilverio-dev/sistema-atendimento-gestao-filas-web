import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Este arquivo só facilita os comandos na raiz; as regras estão no backend.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backend = resolve(root, 'backend/src');
const frontend = resolve(root, 'frontend');
const npmCli = process.env.npm_execpath || resolve(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
const command = process.argv[2];

function npm(directory, args) {
  const result = spawnSync(process.execPath, [npmCli, ...args], { cwd: directory, stdio: 'inherit', windowsHide: true });

  if (result.error) {
    console.error(result.error.message);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function build() {
  npm(backend, ['run', 'build']);
  npm(frontend, ['run', 'build']);
}

if (command === 'setup') {
  npm(backend, ['ci']);
  npm(frontend, ['ci']);
} else if (command === 'check') {
  npm(backend, ['run', 'typecheck']);
  npm(backend, ['test']);
  npm(frontend, ['run', 'typecheck']);
} else if (command === 'build') {
  build();
} else if (command === 'start') {
  // Na primeira execução, prepara automaticamente a versão da apresentação.
  const backendIsBuilt = existsSync(resolve(backend, 'dist/index.js'));
  const frontendIsBuilt = existsSync(resolve(frontend, 'dist/index.html'));

  if (!backendIsBuilt || !frontendIsBuilt) {
    build();
  }

  npm(backend, ['start']);
} else if (command === 'dev') {
  // Processos diretos evitam abrir novas janelas de terminal no Windows.
  const children = [
    spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'index.ts'], { cwd: backend, stdio: 'inherit', windowsHide: true }),
    spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], { cwd: frontend, stdio: 'inherit', windowsHide: true }),
  ];
  function stop() {
    for (const child of children) {
      child.kill();
    }
  }
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  for (const child of children) {
    child.on('error', (error) => {
      console.error(error.message);
      stop();
      process.exitCode = 1;
    });

    child.on('exit', (code) => {
      if (code) {
        process.exitCode = code;
      }

      stop();
    });
  }
} else {
  console.error('Use setup, dev, check, build ou start.');
  process.exitCode = 1;
}
