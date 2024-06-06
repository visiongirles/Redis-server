import { StreamKey, StreamValue, streamStore } from './constants/streamStore';
import { getValueByKeyStreamStore } from './getValueByKeyStreamStore';
import { parseStreamId } from './validateStreamId';

// TODO: узнать что нудно возвращать если не нашли значений в range
export function getStreamValuesByRange(
  streamKey: StreamKey,
  startIndex: string,
  endIndex: string
): StreamValue | null {
  const steamValue = getValueByKeyStreamStore(streamKey);

  if (!steamValue) {
    throw Error(`[getStreamValuesByRange] no value by key: ${streamKey}`);
  }

  const streamValueByRange: StreamValue = new Map();
  console.log('[getStreamValuesByRange] current streamStore:', streamStore);
  const startIndexObject = parseStreamId(startIndex);
  const endIndexObject = parseStreamId(endIndex);

  // timestamp + count
  for (const streamId of steamValue.keys()) {
    console.log('streamId', streamId);
    console.log(
      `streamId.timestamp: ${streamId.timestamp} , startIndex: ${startIndex}`
    );
    if (
      Number(streamId.timestamp) >= Number(startIndexObject.timestamp) &&
      Number(streamId.timestamp) <= Number(endIndexObject.timestamp)
    ) {
      if (
        Number(streamId.count) >= Number(startIndexObject.count) &&
        Number(streamId.count) <= Number(endIndexObject.count)
      ) {
        const streamValueInRange = steamValue.get(streamId);
        if (streamValueInRange) {
          streamValueByRange.set(streamId, streamValueInRange);
        }
      }
    }
  }
  if (streamValueByRange.size === 0) return null;
  return streamValueByRange;
}
