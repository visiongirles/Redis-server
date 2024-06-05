import { streamStore, Stream } from './constants/streamStore';

export function getValueByKeyStreamStore(key: string): Stream[] | null {
  console.log('[getValueByKey] key: ', key);
  const data = streamStore.get(key);

  if (!data) {
    console.log('[GET]: no value by this key');
    return null;
  }

  return data;
}
