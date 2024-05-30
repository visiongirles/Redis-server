import { store } from './constants/store';

export function setStore(
  newStore: Map<string, { value: any; timeToLive: number | null }>
) {
  store.clear();
  newStore.forEach((value, key) => {
    console.log('[setStore] value', value);
    store.set(key, { value: value.value, timeToLive: value.timeToLive });
  });
  // console.log('[setStore] new store: ', store);
}
