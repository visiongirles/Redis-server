import { StreamId, StreamKey, StreamValue } from './constants/streamStore';
import { getValueByKeyInStreamStore } from './getValueByKeyInStreamStore';
import { parseStreamId } from './validateStreamId';

// TODO: узнать что нудно возвращать если не нашли значений в range
export function getStreamValuesByRange(
  streamKey: StreamKey,
  startIndex: string,
  endIndex: string
): StreamValue | null {
  const streamValue = getValueByKeyInStreamStore(streamKey);

  if (!streamValue) {
    throw Error(`[getStreamValuesByRange] no value by key: ${streamKey}`);
  }

  const streamValueByRange: StreamValue = new Map();

  // TODO: unify two IFs into one

  for (const streamId of streamValue.keys()) {
    if (
      isOnlyHasEndIndex(startIndex) &&
      isStreamIdWithinRangeByEndIndex(endIndex, streamId)
    ) {
      const streamValueInRange = streamValue.get(streamId);
      if (streamValueInRange) {
        streamValueByRange.set(streamId, streamValueInRange);
      }
    } else if (
      isOnlyHasStartIndex(endIndex) &&
      isStreamIdWithinRangeByStartIndex(startIndex, streamId)
    ) {
      const streamValueInRange = streamValue.get(streamId);
      if (streamValueInRange) {
        streamValueByRange.set(streamId, streamValueInRange);
      }
    } else {
      if (isStreamIdWithinRangeByBothIndexes(startIndex, endIndex, streamId)) {
        const streamValueInRange = streamValue.get(streamId);
        if (streamValueInRange) {
          streamValueByRange.set(streamId, streamValueInRange);
        }
      }
    }
  }

  if (isStreamValueByRangeEmpty(streamValueByRange)) return null;

  return streamValueByRange;
}

function isOnlyHasEndIndex(startIndex: string): boolean {
  return startIndex === '-';
}

function isStreamIdWithinRangeByEndIndex(
  endIndex: string,
  streamId: StreamId
): boolean {
  const endIndexObject = parseStreamId(endIndex);
  if (Number(streamId.timestamp) <= Number(endIndexObject.timestamp)) {
    if (Number(streamId.count) <= Number(endIndexObject.count)) {
      return true;
    }
  }
  return false;
}

function isOnlyHasStartIndex(endIndex: string) {
  return endIndex === '+';
}

function isStreamIdWithinRangeByStartIndex(
  startIndex: string,
  streamId: StreamId
): boolean {
  const startIndexObject = parseStreamId(startIndex);
  if (Number(streamId.timestamp) >= Number(startIndexObject.timestamp)) {
    if (Number(streamId.count) >= Number(startIndexObject.count)) {
      return true;
    }
  }
  return false;
}

function isStreamIdWithinRangeByBothIndexes(
  startIndex: string,
  endIndex: string,
  streamId: StreamId
): boolean {
  const startIndexObject = parseStreamId(startIndex);
  const endIndexObject = parseStreamId(endIndex);

  if (
    Number(streamId.timestamp) >= Number(startIndexObject.timestamp) &&
    Number(streamId.timestamp) <= Number(endIndexObject.timestamp)
  ) {
    if (
      Number(streamId.count) >= Number(startIndexObject.count) &&
      Number(streamId.count) <= Number(endIndexObject.count)
    ) {
      return true;
    }
  }
  return false;
}

function isStreamValueByRangeEmpty(streamValueByRange: StreamValue) {
  return streamValueByRange.size === 0;
}
