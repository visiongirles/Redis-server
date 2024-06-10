import { streamPromise } from './constants/promiseStore';

export function readStreamAsync(commandOptions: string[]) {
  const promise: Promise<string[] | null> = new Promise((resolve, reject) => {
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
          console.log(
            '[readStreamAsync] I"M AFTER RESOLVE AND I"M DONE. HOW NICE!'
          );
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
