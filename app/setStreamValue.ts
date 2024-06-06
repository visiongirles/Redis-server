import { StreamId, StreamValue } from './constants/streamStore';

export function setStreamValue(
  parsedStreamId: StreamId,
  arrayOfKeysAndValues: string[]
): StreamValue {
  const newStreamValue: StreamValue = new Map();
  const keyValuePairArray = [];
  for (let index = 0; index < arrayOfKeysAndValues.length; index = index + 2) {
    const keyValuePair = {
      key: arrayOfKeysAndValues[index],
      value: arrayOfKeysAndValues[index + 1],
    };
    keyValuePairArray.push(keyValuePair);
  }
  newStreamValue.set(parsedStreamId, keyValuePairArray);
  return newStreamValue;
}
