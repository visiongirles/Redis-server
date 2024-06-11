import { StoreValue, store } from './constants/store';

export function setStore(newStore: Map<string, StoreValue>) {
  store.clear();
  newStore.forEach((data, key) => {
    store.set(key, {
      value: data.value,
      timeToLive: data.timeToLive,
      type: data.type,
    });
  });
}
