import { StreamId, StreamValue } from './constants/streamStore';

const defaultId = { timeInMs: 0, count: 0 };

export function validateStreamId(
  newStreamId: StreamId,
  streamValue: StreamValue
): boolean {
  const streamIdArray = Array.from(streamValue.keys());

  // for (let index = streamIdArray.length - 1; index >= 0; index--) {
  const indexOfLastStream = streamIdArray.length - 1;
  const lastStreamId = streamIdArray[indexOfLastStream];

  if (newStreamId.timestamp > lastStreamId.timestamp) {
    return true;
  } else if (newStreamId.timestamp === lastStreamId.timestamp) {
    return newStreamId.count > lastStreamId.count;
  } else {
    return false;
  }
  // }
}

export function isStreamIdEqualsDefault(streamId: StreamId): boolean {
  // retrieve time in milliseconds and count from id
  // check if id doesn't equal default values
  if (
    Number(streamId.timestamp) === defaultId.timeInMs &&
    Number(streamId.count) === defaultId.count
  ) {
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
