import { QueueNode } from './queue-node';

// FIFO: o primeiro a entrar é o primeiro a sair.
// A estrutura não escolhe prioridades; ela apenas mantém a ordem de chegada.
export class Queue<T> {
  private head: QueueNode<T> | null;
  private tail: QueueNode<T> | null;
  private count: number;

  constructor() {
    // Ao criar a fila, início e fim estão vazios e o tamanho é zero.
    this.head = null;
    this.tail = null;
    this.count = 0;
  }

  // get permite consultar queue.size sem alterar o contador diretamente.
  get size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.head === null;
  }

  enqueue(value: T): void {
    const newNode = new QueueNode(value);

    if (this.tail === null) {
      // Na primeira inserção, o novo nó também é o início da fila.
      this.head = newNode;
    } else {
      // O antigo último nó passa a apontar para o novo nó.
      this.tail.next = newNode;
    }

    this.tail = newNode;
    this.count += 1;
  }

  dequeue(): T | null {
    if (this.head === null) {
      return null;
    }

    const value = this.head.value;

    // O segundo nó passa a ser o início. Se não existir, o início fica nulo.
    this.head = this.head.next;
    this.count -= 1;

    if (this.head === null) {
      // Ao retirar o último nó, o fim também precisa ficar vazio.
      this.tail = null;
    }

    return value;
  }

  toArray(): T[] {
    const values: T[] = [];
    let currentNode = this.head;

    // Percorremos os nós sem mudar início, fim ou tamanho.
    // O array é usado para exibir a fila; os nós continuam sendo a estrutura real.
    while (currentNode !== null) {
      values.push(currentNode.value);
      currentNode = currentNode.next;
    }

    return values;
  }
}
