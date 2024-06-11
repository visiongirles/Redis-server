import { escapeSymbols } from './constants/constants';
import { StreamValue } from './constants/streamStore';
import { setArrayInResp } from './setArrayInResp';
import { setBulkStringinResp } from './setBulkStringinResp';
import { setStreamIdToString } from './validateStreamId';

export function setStreamstoreValueIntoRESPResponse(
  streamValueInRange: StreamValue,
  streamKey: string
): string {
  // START OF STREAM KEY ARRAY
  const [streamIdBylkString, innerArrayBulkString] =
    getKeyValuePairsArray(streamValueInRange);

  const streamIdAndInnerArray = setArrayInResp(
    streamIdBylkString,
    innerArrayBulkString
  ); // key value pair of Map + streamID

  const outterArray = setArrayInResp(streamIdAndInnerArray); // streamId level merge

  const keyStreamBulkString = setBulkStringinResp(streamKey);

  const arrayOfStreams = setArrayInResp(keyStreamBulkString, outterArray); // streamKey and otter array merge
  // END OF STREAMKEY ARRAY
  return arrayOfStreams;
}

function getKeyValuePairsArray(streamValueInRange: StreamValue): string[] {
  let innerArray: string[] = [];
  let innerArrayBulkString = '';
  let streamIdBylkString = '';
  for (const [streamId, keyValuePairArray] of streamValueInRange.entries()) {
    for (const keyValuePair of keyValuePairArray) {
      innerArray.push(keyValuePair.key);
      innerArray.push(String(keyValuePair.value));
    }
    innerArrayBulkString =
      '*' +
      innerArray.length +
      escapeSymbols +
      setBulkStringinResp(...innerArray);

    streamIdBylkString = setBulkStringinResp(setStreamIdToString(streamId));
  }

  return [streamIdBylkString, innerArrayBulkString];
}
