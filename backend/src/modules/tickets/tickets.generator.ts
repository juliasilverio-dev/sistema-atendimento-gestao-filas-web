import { randomInt } from 'node:crypto';

export type CodeGenerator = () => string;

// Sem 0, O, 1 e I para facilitar a leitura no painel.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateTicketCode(): string {
  let code = '';

  for (let index = 0; index < 8; index += 1) {
    const randomPosition = randomInt(ALPHABET.length);
    const character = ALPHABET[randomPosition];
    code += character;
  }

  // O código identifica a senha. A ordem de chamada é definida pelos nós da fila.
  return code;
}
