import { Preset } from '@/types';

export const factorial: Preset = {
  id: 'factorial',
  name: 'Factorial',
  description:
    'Computes n! by multiplying n by the factorial of (n-1). Produces a linear call chain.',
  code: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`,
  defaultInput: 'factorial(6)',
  complexity: 'O(n)',
};
