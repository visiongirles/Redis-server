import { StoreValue, store } from './constants/store';

export function setKeyValueToStore(key: string, value: StoreValue) {
  store.set(key, value);
}
