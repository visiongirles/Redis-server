import { store } from './constants/store';

export function getValueByKey(key: string): string | null {
  const data = store.get(key);

  if (!data) {
    console.log('[GET]: no key');
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

  return data.value;
}
