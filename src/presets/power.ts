import { Preset } from '@/types';

export const power: Preset = {
  id: 'power',
  name: 'Power (Fast Exponentiation)',
  description:
    'Computes base^exp using fast exponentiation by squaring. Halves the exponent each step for O(log n) calls.',
  code: `function power(base, exp) {
  if (exp === 0) return 1;
  if (exp % 2 === 0) {
    const half = power(base, exp / 2);
    return half * half;
  }
  return base * power(base, exp - 1);
}`,
  defaultInput: 'power(2, 10)',
  complexity: 'O(log n)',
};
