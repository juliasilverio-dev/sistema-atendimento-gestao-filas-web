import { resolve } from 'node:path';
import { createApp } from './app';

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT deve ser uma porta válida entre 1 e 65535.');
}

// Os comandos npm são executados em backend/src.
const app = createApp({ frontendDirectory: resolve(process.cwd(), '../../frontend/dist') });

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
