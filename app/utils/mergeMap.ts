import { KeyValuePair, StreamId } from '../constants/streamStore';

export function mergeMaps(
  currentMap: Map<StreamId, KeyValuePair[]>,
  newMap: Map<StreamId, KeyValuePair[]>
) {
  const mergedMap = new Map();

  // Add values from first Map
  for (const [key, value] of currentMap) {
    mergedMap.set(key, value);
  }

  // Add values from second Map
  for (const [key, value] of newMap) {
    mergedMap.set(key, value);
  }

  return mergedMap;
}
