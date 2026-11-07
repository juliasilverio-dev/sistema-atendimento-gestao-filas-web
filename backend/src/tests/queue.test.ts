import assert from 'node:assert/strict';
import test from 'node:test';
import { Queue } from '../compartilhado/estruturas-de-dados/queue';

test('Fila: vazia, único nó, esvaziamento e nova inserção', () => {
  const queue = new Queue<string>();
  assert.equal(queue.size, 0);
  assert.equal(queue.isEmpty(), true);
  assert.equal(queue.dequeue(), null);
  queue.enqueue('A');
  assert.equal(queue.size, 1);
  assert.equal(queue.isEmpty(), false);
  assert.equal(queue.dequeue(), 'A');
  assert.equal(queue.size, 0);
  assert.equal(queue.isEmpty(), true);
  queue.enqueue('B');
  queue.enqueue('C');
  assert.equal(queue.dequeue(), 'B');
  assert.equal(queue.dequeue(), 'C');
  assert.equal(queue.dequeue(), null);
  assert.equal(queue.size, 0);
});

test('Fila: percurso preserva a ordem FIFO e não consome os nós', () => {
  const queue = new Queue<number>();
  queue.enqueue(30);
  queue.enqueue(10);
  queue.enqueue(20);
  const view = queue.toArray();
  view.reverse();
  assert.deepEqual(queue.toArray(), [30, 10, 20]);
  assert.equal(queue.size, 3);
  assert.equal(queue.dequeue(), 30);
  queue.enqueue(5);
  assert.deepEqual(queue.toArray(), [10, 20, 5]);
});
