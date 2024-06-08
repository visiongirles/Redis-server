import { KeyValuePair, StreamId } from './constants/streamStore';

export function mergeMaps(
  currentMap: Map<StreamId, KeyValuePair[]>,
  newMap: Map<StreamId, KeyValuePair[]>
) {
  const mergedMap = new Map();

  // Добавляем значения из первой Map
  for (const [key, value] of currentMap) {
    mergedMap.set(key, value);
  }

  // Добавляем значения из второй Map
  for (const [key, value] of newMap) {
    mergedMap.set(key, value);
  }

  return mergedMap;
}
