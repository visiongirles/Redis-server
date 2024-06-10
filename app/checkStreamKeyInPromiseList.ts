import { streamPromise } from './constants/promiseStore';

export function checkStreamKeyInPromiseList(streamKey: string) {
  return streamPromise.get(streamKey);
}
