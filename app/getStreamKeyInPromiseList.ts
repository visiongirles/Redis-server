import { streamPromise } from './constants/promiseStore';

export function getStreamKeyInPromiseList(streamKey: string) {
  return streamPromise.get(streamKey);
}
