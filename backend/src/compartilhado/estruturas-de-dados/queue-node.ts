// Cada nó guarda um valor e a ligação para o próximo nó.
// T representa o tipo do valor: no sistema, usamos uma senha (Ticket).
export class QueueNode<T> {
  // readonly impede trocar o valor do nó depois da criação.
  public readonly value: T;
  public next: QueueNode<T> | null;

  constructor(value: T) {
    this.value = value;
    this.next = null; // O novo nó ainda não aponta para outro nó.
  }
}
