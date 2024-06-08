import * as net from 'net';
import { getStreamValuesByRange } from '../getStreamValuesByRange';
import { setStreamstoreValueIntoRESPResponse } from '../setStreamstoreValueIntoRESPResponse';

export function setXReadResponse(
  commandOptions: string[],
  connection: net.Socket
) {
  const streamKey = commandOptions[1];
  let streamId = commandOptions[2];

  // const streamValue = getValueByKeyStreamStore(streamKey);
  const endIndex = '+';
  const streamValueInRange = getStreamValuesByRange(
    streamKey,
    streamId,
    endIndex
  );

  if (!streamValueInRange) {
    console.log('streamValueInRange ===', streamValueInRange);
    throw Error(
      `[XREAD] no value by key ${streamKey} between ${streamId} and ${endIndex}`
    );
  }

  const response = setStreamstoreValueIntoRESPResponse(
    streamValueInRange,
    streamKey
  );
  console.log(`[XREAD]: response: `, response.replaceAll('\r\n', '\\r\\n'));
  connection.write(response);
}
