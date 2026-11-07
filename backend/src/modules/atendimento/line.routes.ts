import { Router } from 'express';
import { LineService } from './line.service';

export function createLineRouter(service: LineService): Router {
  const router = Router();
  router.get('/', (_request, response) => {
    const snapshot = service.getSnapshot();
    response.json({ data: snapshot });
  });
  router.post('/next', (_request, response) => {
    const ticket = service.callNext();

    if (ticket === null) {
      response.json({ data: null, message: 'Não há senhas aguardando.' });
    } else {
      response.json({ data: ticket });
    }
  });
  return router;
}
