import * as net from 'net';
import { escapeSymbols } from '../constants/constants';
import { setRESPArray } from '../setRESPArray';
import { setStreamIdToString } from '../validateStreamId';
import { getStreamValuesByRange } from '../getStreamValuesByRange';

export function setXrangeResponse(
  commandOptions: string[],
  connection: net.Socket
) {
  const [streamKey, startIndex, endIndex] = commandOptions;
  const streamValueInRange = getStreamValuesByRange(
    streamKey,
    startIndex,
    endIndex
  );
  if (!streamValueInRange) {
    throw Error(
      `[XRANGE] no value by key ${streamKey} between ${startIndex} and ${endIndex}`
    );
  }
  let response = '';
  const outerArrayString = streamValueInRange.size;
  response = '*' + outerArrayString + escapeSymbols;
  for (const [streamId, keyValuePairArray] of streamValueInRange.entries()) {
    let innerArray: string[] = [];

    for (const keyValuePair of keyValuePairArray) {
      innerArray.push(keyValuePair.key);
      innerArray.push(String(keyValuePair.value));
    }
    const innerArrayString = setRESPArray(...innerArray);
    response += setRESPArray(setStreamIdToString(streamId));
    response += innerArrayString;
  }
  connection.write(response);
}
