import * as net from 'net';
import { getValueByKeyInStreamStore } from '../getValueByKeyInStreamStore';

import { setStreamId } from '../setStreamId';
import {
  isStreamIdEqualsDefault,
  parseStreamId,
  setStreamIdToString,
  validateStreamId,
} from '../validateStreamId';
import { setStreamValue } from '../setStreamValue';
import { streamPromise } from '../constants/promiseStore';
import { mergeMaps } from '../utils';
import { StreamId, streamStore } from '../constants/streamStore';
import { setBulkStringinResp } from '../setBulkStringinResp';
import { getStreamKeyInPromiseList } from '../getStreamKeyInPromiseList';

export function setXaddResponse(
  commandOptions: string[],
  connection: net.Socket
) {
  const streamKey = commandOptions[0];
  let streamId = commandOptions[1];
  const arrayOfKeysAndValues = commandOptions.slice(2, commandOptions.length);
  const streamValue = getValueByKeyInStreamStore(streamKey);

  // case #3  '*'
  if (isStreamIdNotDefined(streamId)) {
    streamId = setStreamId();
  }

  let parsedStreamId = parseStreamId(streamId);

  // NO VALUE CASE
  if (!streamValue) {
    // case #2 'timestamp-*
    if (isParsedStreamIdWithoutCount(parsedStreamId)) {
      parsedStreamId.count = setParsedStreamIdCount(parsedStreamId);
    }
    const newStreamValue = setStreamValue(parsedStreamId, arrayOfKeysAndValues);

    finishXaddCommand(
      streamKey,
      newStreamValue,
      parsedStreamId,
      connection,
      commandOptions
    );

    return;
  }

  // VALUE CASE

  if (isParsedStreamIdWithoutCount(parsedStreamId)) {
    parsedStreamId.count = setParsedStreamIdCount(parsedStreamId);

    // increment id.count if there are some items with the same timestamp
    for (let currentStreamId of streamValue.keys()) {
      if (currentStreamId.timestamp === parsedStreamId.timestamp) {
        parsedStreamId.count = String(Number(currentStreamId.count) + 1);
        break;
      }
    }
    const newStreamValue = setStreamValue(parsedStreamId, arrayOfKeysAndValues);

    const updatedValue = mergeMaps(streamValue, newStreamValue);
    finishXaddCommand(
      streamKey,
      updatedValue,
      parsedStreamId,
      connection,
      commandOptions
    );

    return;
  }

  if (isStreamIdEqualsDefault(parsedStreamId)) {
    const error = `-ERR The ID specified in XADD must be greater than 0-0\r\n`;
    connection.write(error);
    return;
  }

  if (validateStreamId(parsedStreamId, streamValue)) {
    const newStreamValue = setStreamValue(parsedStreamId, arrayOfKeysAndValues);

    const updatedValue = mergeMaps(streamValue, newStreamValue);
    finishXaddCommand(
      streamKey,
      updatedValue,
      parsedStreamId,
      connection,
      commandOptions
    );

    return;
  }
  const error = `-ERR The ID specified in XADD is equal or smaller than the target stream top item\r\n`;
  connection.write(error);

  // Step 2: Check promise list
  checkStreamKeyInPromiseList(streamKey, commandOptions);
}

function finishXaddCommand(
  streamKey: string,
  updatedValue: Map<any, any>,
  parsedStreamId: StreamId,
  connection: net.Socket,
  commandOptions: string[]
) {
  streamStore.set(streamKey, updatedValue);
  const response = setBulkStringinResp(setStreamIdToString(parsedStreamId));
  connection.write(response);
  checkStreamKeyInPromiseList(streamKey, commandOptions);
}

function checkStreamKeyInPromiseList(
  streamKey: string,
  commandOptions: string[]
) {
  const promise = getStreamKeyInPromiseList(streamKey);
  if (promise !== undefined) {
    const value = ['streams', ...commandOptions.slice(0, 2)];
    promise(value);
    streamPromise.delete(streamKey);
  }
}

export function isParsedStreamIdWithoutCount(
  parsedStreamId: StreamId
): boolean {
  return parsedStreamId.count === '*';
}

export function isStreamIdNotDefined(streamId: string): boolean {
  return streamId === '*';
}

export function setParsedStreamIdCount(parsedStreamId: StreamId): string {
  return parsedStreamId.timestamp === '0' ? '1' : '0';
}
