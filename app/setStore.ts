import { StoreValue, store } from './constants/store';

export function setStore(newStore: Map<string, StoreValue>) {
  store.clear();
  newStore.forEach((data, key) => {
    console.log('[setStore] value', data);
    store.set(key, {
      value: data.value,
      timeToLive: data.timeToLive,
      type: data.type,
    });
  });
  // console.log('[setStore] new store: ', store);
}
