import { Stream, store } from './constants/store';

const defaultId = { timeInMs: 0, count: 0 };

export function validateStreamId(id: string): boolean {
  // retrieve time in milliseconds and count from id
  const [timeInMs, count] = parseStreamId(id);

  // convert store to array to retrieve value in order they were added

  const array = Array.from(store);

  // check for the last stream entry
  checkLoop: for (let index = array.length - 1; index >= 0; index--) {
    const value = array[index][1].value;

    if (typeof value === 'object') {
      console.log('[validateStreamId] value', value);
      const [lastStreamTimeInMs, lastStreamCount] = value.id
        .split('-')
        .map((item) => Number(item));

      if (timeInMs < lastStreamTimeInMs) {
        console.log(
          '[validateStreamId] timestamp of new entry is earlier than the last stream entry in database'
        );

        return false;
      }
      if (timeInMs === lastStreamTimeInMs && count <= lastStreamCount) {
        console.log(
          '[validateStreamId] timestamp of new entry equals the last stream entry in database, but count is smaller'
        );
        return false;
      }
      break checkLoop;
    }
  }

  // if no key with stream found, we can add new stream data as valid
  return true;
}

export function isStreamIdEqualsDefault(id: string): boolean {
  // retrieve time in milliseconds and count from id
  const [timeInMs, count] = parseStreamId(id);
  console.log('[validateStreamId] timeInMs, count', timeInMs, count);
  // check if id doesn't equal default values
  if (timeInMs === defaultId.timeInMs && count === defaultId.count) {
    console.log('[validateStreamId] id equals default values 0-0');
    return true;
  }
  return false;
}

function parseStreamId(id: string) {
  return id.split('-').map((item) => Number(item));
}
