import express from 'express';
import { SERVICE_CATALOG } from './modules/service/service.types';
import { TICKET_CATEGORIES } from './modules/tickets/tickets.types';

// A aplicação é criada aqui; a porta de rede só é aberta em index.ts.
// Isso permite importar a API nos testes sem iniciar o servidor da apresentação.
export const app = express();

app.use(express.json());

app.get('/api/categories', (_req, res) => {
  res.json({ data: TICKET_CATEGORIES });
});

app.get('/api/services', (_req, res) => {
  res.json({ data: SERVICE_CATALOG });
});

// Rotas demonstrativas da estrutura inicial. A emissão e as filas serão
// conectadas aos seus casos de uso nas próximas etapas.
app.get('/gerarSenha', (_req, res) => {
  res.json({ mensagem: 'Uma senha será gerada!' });
});

app.get('/consultarFilas', (_req, res) => {
  res.json({ mensagem: 'A lista de filas será exibida!' });
});

app.get('/realizarAtendimento', (_req, res) => {
  res.json({ mensagem: 'O atendimento será realizado!' });
});
