import * as net from 'net';
import { getStreamValuesByRange } from '../getStreamValuesByRange';
import { setStreamstoreValueIntoRESPResponse } from '../setStreamstoreValueIntoRESPResponse';
import { setArrayInResp } from '../setArrayInResp';
import { readStreamAsync } from '../readStreamAsync';
import { nullBulkString } from '../constants/constants';

export async function setXReadResponse(
  commandOptions: string[],
  connection: net.Socket
) {
  // XREAD block 1000 streams stream_key 0-1
  // XREAD streams stream_key 0-1
  const type = commandOptions[0];
  switch (type) {
    case 'block': {
      try {
        const value = await readStreamAsync(commandOptions);

        if (value === null) {
          connection.write(nullBulkString);
        } else {
          setXReadResponse(value, connection);
        }
      } catch (error) {
        throw Error("[setXReadResponse] case 'block' was rejected ");
      }
      break;
    }
    case 'streams': {
      const keyStreamCount = (commandOptions.length - 1) / 2;

      let streamValueInRangeArray = [];
      for (let index = 0; index < keyStreamCount; index++) {
        const streamKey = commandOptions[index + 1];
        const startIndex = commandOptions[keyStreamCount + index + 1];
        const endIndex = '+';

        const streamValueInRange = getStreamValuesByRange(
          streamKey,
          startIndex,
          endIndex
        );
        if (!streamValueInRange) {
          throw Error(
            `[XREAD] no value by key ${streamKey} between ${startIndex} and ${endIndex}`
          );
        }
        const arrayOfStreams = setStreamstoreValueIntoRESPResponse(
          streamValueInRange,
          streamKey
        );
        streamValueInRangeArray.push(arrayOfStreams);
      }

      const response = setArrayInResp(...streamValueInRangeArray);

      connection.write(response);
      break;
    }
    default: {
      throw Error(
        `[setXReadResponse] default case has not been implemented yet for type: ${type}`
      );
    }
  }
}
