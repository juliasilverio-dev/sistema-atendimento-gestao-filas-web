import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../erros/app-error';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' } });
};

// Um formato de erro único facilita o tratamento nas três telas.
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.status).json({
      error: { code: error.code, message: error.message, details: error.details },
    });
    return;
  }
  if (error && error.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'O corpo enviado deve ser um JSON válido.' } });
    return;
  }
  if (error && error.type === 'entity.too.large') {
    res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Os dados enviados excedem o tamanho permitido.' } });
    return;
  }
  console.error('Falha inesperada na API:', error);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Não foi possível realizar a operação. Tente novamente.' } });
};
