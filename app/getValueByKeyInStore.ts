import { StoreValue, store } from './constants/store';

export function getValueByKeyInStore(key: string): StoreValue | null {
  const data = store.get(key);
  if (!data) {
    return null;
  }

  const expiry = data.timeToLive;
  if (expiry) {
    const isExpired = expiry < Date.now();

    if (isExpired) {
      store.delete(key);
      return null;
    }
  }

  return data;
}

export function getObjectByKeyStore(key: string): StoreValue | null {
  const data = store.get(key);

  if (!data) {
    return null;
  }

  const expiry = data.timeToLive;

  if (expiry) {
    const isExpired = expiry < Date.now();

    if (isExpired) {
      store.delete(key);
      return null;
    }
  }

  return data;
}
