import { Preset } from '@/types';

export const binarySearch: Preset = {
  id: 'binarySearch',
  name: 'Binary Search',
  description:
    'Searches a sorted array by repeatedly halving the search range. Produces a linear chain of calls with O(log n) depth.',
  code: `function binarySearch(arr, target, low, high) {
  if (low > high) return -1;
  const mid = Math.floor((low + high) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) {
    return binarySearch(arr, target, mid + 1, high);
  }
  return binarySearch(arr, target, low, mid - 1);
}`,
  defaultInput: 'binarySearch([1, 3, 5, 7, 9, 11, 13], 7, 0, 6)',
  complexity: 'O(log n)',
};
