import { Preset } from '@/types';
import { fibonacci } from './fibonacci';
import { factorial } from './factorial';
import { mergeSort } from './mergeSort';
import { towerOfHanoi } from './towerOfHanoi';
import { binarySearch } from './binarySearch';
import { power } from './power';
import { sumArray } from './sumArray';

export const presets: Preset[] = [
  fibonacci,
  factorial,
  mergeSort,
  towerOfHanoi,
  binarySearch,
  power,
  sumArray,
];

export function getPresetById(id: string): Preset | undefined {
  return presets.find((p) => p.id === id);
}
