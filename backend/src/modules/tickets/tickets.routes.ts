import { Router } from 'express';
import { TicketsService } from './tickets.service';

export function createTicketsRouter(service: TicketsService): Router {
  const router = Router();
  // O transporte HTTP só recebe a entrada e apresenta o resultado do serviço.
  router.post('/', (request, response) => {
    const ticket = service.create(request.body);
    response.status(201).json({ data: ticket });
  });
  return router;
}
