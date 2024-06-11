import { streamStore, StreamValue } from './constants/streamStore';

export function getValueByKeyInStreamStore(
  streamKey: string
): StreamValue | null {
  const data = streamStore.get(streamKey);

  if (!data) {
    return null;
  }

  return data;
}
