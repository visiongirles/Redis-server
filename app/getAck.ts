import { listOfReplicas } from './constants/listOfReplicas';

export function getAck(
  data: string | Buffer,
  timeout: number
): Promise<Buffer[]> {
  const promises: Promise<Buffer>[] = [];

  listOfReplicas.forEach((replica) => {
    replica.write(data);

    const promise: Promise<Buffer> = new Promise((resolve, reject) => {
      // console.log('Stage #1 Promise');
      function onData(data: Buffer) {
        // console.log('Stage #2 in on data event Promise');
        resolve(data);
        clearTimeout(timeoutId);
        replica.removeListener('data', onData);
      }

      function onError(error: Error) {
        reject(error);
      }

      replica.on('data', onData);
      replica.on('error', onError);

      const timeoutId = setTimeout(() => {
        const replicaIsDead = Buffer.from(`replica is dead`);
        resolve(replicaIsDead);
      }, timeout);
    });

    promises.push(promise);
    // console.log('[propagateCommandToReplicas]: ', replica);
  });
  return Promise.all(promises);
}
