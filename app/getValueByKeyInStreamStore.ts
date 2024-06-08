import { streamStore, StreamValue } from './constants/streamStore';

export function getValueByKeyInStreamStore(
  streamKey: string
): StreamValue | null {
  console.log('[getValueByKey] key: ', streamKey);
  const data = streamStore.get(streamKey);

  if (!data) {
    console.log('[GET]: no value by this key');
    return null;
  }

  return data;
}
