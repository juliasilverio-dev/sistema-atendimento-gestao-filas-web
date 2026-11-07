import express from 'express';
import type { Application } from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { SERVICE_CATALOG } from './modules/service/service.types';
import { TICKET_CATEGORIES } from './modules/tickets/tickets.types';
import { TicketsRepository } from './modules/tickets/tickets.repository';
import { TicketsService } from './modules/tickets/tickets.service';
import type { CodeGenerator } from './modules/tickets/tickets.generator';
import { createTicketsRouter } from './modules/tickets/tickets.routes';
import { LineService } from './modules/atendimento/line.service';
import { createLineRouter } from './modules/atendimento/line.routes';
import { errorHandler, notFoundHandler } from './compartilhado/respostas-http/error-handler';
import type { Clock } from './compartilhado/clock';

// O ponto de interrogação indica uma configuração opcional.
export interface AppOptions {
  generateCode?: CodeGenerator;
  now?: Clock;
  frontendDirectory?: string;
}

// Cada aplicação recebe um estado próprio. Nos testes, podemos trocar o relógio
// e o gerador; na apresentação, usamos as implementações reais.
export function createApp(options: AppOptions = {}): Application {
  const app = express();
  const repository = new TicketsRepository();
  const tickets = new TicketsService(repository, options.generateCode, options.now);
  const line = new LineService(repository, options.now);

  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.get('/api/categories', (_request, response) => {
    response.json({ data: TICKET_CATEGORIES });
  });
  app.get('/api/services', (_request, response) => {
    response.json({ data: SERVICE_CATALOG });
  });
  app.use('/api/tickets', createTicketsRouter(tickets));
  app.use('/api/line', createLineRouter(line));
  app.use('/api', notFoundHandler);

  // Após o build, a própria API também serve as três páginas na mesma origem.
  // Assim a demonstração pronta precisa de apenas um servidor, sem CORS.
  if (options.frontendDirectory && existsSync(join(options.frontendDirectory, 'index.html'))) {
    const directory = options.frontendDirectory;
    app.use(express.static(directory));
    app.get(['/', '/totem', '/filas', '/atendimento'], (_req, res) => {
      res.sendFile(join(directory, 'index.html'));
    });
  }
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

// Importar a aplicação não abre uma porta de rede.
export const app = createApp();
