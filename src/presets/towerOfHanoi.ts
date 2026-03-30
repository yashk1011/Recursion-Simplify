import { Preset } from '@/types';

export const towerOfHanoi: Preset = {
  id: 'towerOfHanoi',
  name: 'Tower of Hanoi',
  description:
    'Moves n disks from source to target using an auxiliary peg. Each call makes two recursive calls, producing 2^n - 1 total moves.',
  code: `function hanoi(n, from, to, aux) {
  if (n === 0) return;
  hanoi(n - 1, from, aux, to);
  // Move disk n from 'from' to 'to'
  hanoi(n - 1, aux, to, from);
}`,
  defaultInput: 'hanoi(3, "A", "C", "B")',
  complexity: 'O(2^n)',
};
