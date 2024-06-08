import * as net from 'net';
import { getStreamValuesByRange } from '../getStreamValuesByRange';
import { setStreamstoreValueIntoRESPResponse } from '../setStreamstoreValueIntoRESPResponse';
import { setArrayInResp } from '../setArrayInResp';

export function setXReadResponse(
  commandOptions: string[],
  connection: net.Socket
) {
  const keyStreamCount = (commandOptions.length - 1) / 2;
  console.log(`[setXReadResponse]: keyStreamCount`, keyStreamCount);

  let streamValueInRangeArray = [];
  console.log(`[setXReadResponse]: commandOptions`, commandOptions);
  for (let index = 0; index < keyStreamCount; index++) {
    const streamKey = commandOptions[index + 1];
    const startIndex = commandOptions[keyStreamCount + index + 1];
    const endIndex = '+';
    console.log(`[setXReadResponse]: startIndex`, startIndex);

    const streamValueInRange = getStreamValuesByRange(
      streamKey,
      startIndex,
      endIndex
    );
    if (!streamValueInRange) {
      console.log('streamValueInRange ===', streamValueInRange);
      throw Error(
        `[XREAD] no value by key ${streamKey} between ${startIndex} and ${endIndex}`
      );
    }
    const arrayOfStreams = setStreamstoreValueIntoRESPResponse(
      streamValueInRange,
      streamKey
    );
    streamValueInRangeArray.push(arrayOfStreams);
    console.log(`[setXReadResponse] arrayOfStreams : `, arrayOfStreams);
    // streamValueInRangeArray.push(streamValueInRange);
  }

  const response = setArrayInResp(...streamValueInRangeArray);
  // return setArrayInResp(...streamValueInRangeArray);

  // const streamKey = commandOptions[1];
  // let streamId = commandOptions[2];

  // const streamValue = getValueByKeyStreamStore(streamKey);

  // const streamValueInRange = getStreamValuesByRange(
  //   streamKey,
  //   streamId,
  //   endIndex
  // );

  // if (!streamValueInRange) {
  //   console.log('streamValueInRange ===', streamValueInRange);
  //   throw Error(
  //     `[XREAD] no value by key ${streamKey} between ${streamId} and ${endIndex}`
  //   );
  // }

  console.log(`[XREAD]: response: `, response.replaceAll('\r\n', '\\r\\n'));
  connection.write(response);
}
