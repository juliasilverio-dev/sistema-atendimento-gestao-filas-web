// Clock é uma função sem parâmetros que devolve uma data.
// Os testes podem fornecer uma data fixa no lugar do relógio real.
export type Clock = () => Date;

export function getCurrentTime(): Date {
  return new Date();
}
