import { streamPromise } from './constants/promiseStore';

export function readStreamAsync(commandOptions: string[]) {
  const promise: Promise<string[] | null> = new Promise((resolve, _) => {
    const timeout = commandOptions[1];
    let timeoutId: NodeJS.Timeout;

    switch (timeout) {
      case '0': {
        // without timeout
        break;
      }
      default: {
        timeoutId = setTimeout(() => {
          streamPromise.delete(keyStream);
          resolve(null);
        }, Number(timeout));

        break;
      }
    }
    const keyStream = commandOptions[3];

    streamPromise.set(keyStream, (commandOptions: string[]) => {
      resolve(commandOptions);
      clearTimeout(timeoutId);
    });
  });

  return promise;
}
