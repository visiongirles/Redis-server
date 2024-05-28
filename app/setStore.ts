import { store } from './constants/store';

export function setStore(newStore: Map<string, any>) {
  store.clear();
  newStore.forEach((value, key) => {
    store.set(key, { value: value, timeToLive: null });
  });
  console.log('[setStore] new store: ', store);
}
