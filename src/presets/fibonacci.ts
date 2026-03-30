import { Preset } from '@/types';

export const fibonacci: Preset = {
  id: 'fibonacci',
  name: 'Fibonacci',
  description:
    'Computes the nth Fibonacci number. Each call branches into two recursive calls, creating an exponential call tree.',
  code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
  defaultInput: 'fibonacci(5)',
  complexity: 'O(2^n)',
};
