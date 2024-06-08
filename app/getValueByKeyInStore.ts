import { StoreValue, store } from './constants/store';

export function getValueByKeyInStore(key: string): StoreValue | null {
  console.log('[getValueByKey] key: ', key);
  const data = store.get(key);
  console.log('Store: ', store);
  if (!data) {
    console.log('[GET]: no value by this key');
    return null;
  }

  const expiry = data.timeToLive;
  console.log(`[getValueByKeyStore] key: '${key}' has expiry`, expiry);
  if (expiry) {
    const isExpired = expiry < Date.now();

    if (isExpired) {
      store.delete(key);
      console.log('[GET]: expired key');

      return null;
    }
  }

  return data;
}

export function getObjectByKeyStore(key: string): StoreValue | null {
  console.log('[getValueByKey] key: ', key);
  const data = store.get(key);

  if (!data) {
    console.log('[GET]: no value by this key');
    return null;
  }

  const expiry = data.timeToLive;

  if (expiry) {
    const isExpired = expiry < Date.now();

    if (isExpired) {
      store.delete(key);
      console.log('[GET]: expired key');

      return null;
    }
  }

  return data;
}