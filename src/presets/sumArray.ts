import { Preset } from '@/types';

export const sumArray: Preset = {
  id: 'sumArray',
  name: 'Sum of Array',
  description:
    'Recursively sums an array by adding the first element to the sum of the rest. Produces a linear call chain.',
  code: `function sumArray(arr) {
  if (arr.length === 0) return 0;
  return arr[0] + sumArray(arr.slice(1));
}`,
  defaultInput: 'sumArray([1, 2, 3, 4, 5])',
  complexity: 'O(n)',
};
