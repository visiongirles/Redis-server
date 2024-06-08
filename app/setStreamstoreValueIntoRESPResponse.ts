import { escapeSymbols } from './constants/constants';
import { StreamValue } from './constants/streamStore';
import { setArrayInResp } from './setArrayInResp';
import { setBulkStringinResp } from './setBulkStringinResp';
import { setStreamIdToString } from './validateStreamId';

export function setStreamstoreValueIntoRESPResponse(
  streamValueInRange: StreamValue,
  streamKey: string
): string {
  const [streamIdBylkString, innerArrayBulkString] =
    getKeyValuePairsArray(streamValueInRange);

  // response += innerArrayString;

  const streamIdAndInnerArray = setArrayInResp(
    streamIdBylkString,
    innerArrayBulkString
  );
  const outterArray = setArrayInResp(streamIdAndInnerArray);
  const keyStreamBulkString = setBulkStringinResp(streamKey);
  const arrayOfStreams = setArrayInResp(keyStreamBulkString, outterArray);
  return setArrayInResp(arrayOfStreams);
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
