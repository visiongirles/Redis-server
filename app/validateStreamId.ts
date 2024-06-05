import { Stream, StreamId, streamStore } from './constants/streamStore';
import { getValueByKeyStreamStore } from './getValueByKeyStreamStore';

const defaultId = { timeInMs: 0, count: 0 };

export function validateStreamId(
  streamId: StreamId,
  stream: Stream[]
): boolean {
  for (let index = stream.length - 1; index >= 0; index--) {
    const lastStreamId = stream[index].id;

    if (streamId.timestamp > lastStreamId.timestamp) {
      return true;
    } else if (streamId.timestamp === lastStreamId.timestamp) {
      return streamId.count > lastStreamId.count ? true : false;
    } else {
      return false;
    }
  }
}

export function isStreamIdEqualsDefault(streamId: StreamId): boolean {
  // retrieve time in milliseconds and count from id
  // check if id doesn't equal default values
  if (
    Number(streamId.timestamp) === defaultId.timeInMs &&
    Number(streamId.count) === defaultId.count
  ) {
    console.log('[validateStreamId] id equals default values 0-0');
    return true;
  }
  return false;
}

export function parseStreamId(id: string): StreamId {
  const [timestamp, count] = id.split('-');
  return { timestamp: timestamp, count: count };
}

export function setStreamIdToString(streamId: StreamId): string {
  return streamId.timestamp + '-' + streamId.count;
}
