import { replicasList } from './constants/replicasList';

export function getAck(
  data: string | Buffer,
  timeout: number
): Promise<Buffer[]> {
  const promises: Promise<Buffer>[] = [];

  replicasList.forEach((replica) => {
    replica.write(data);

    const promise: Promise<Buffer> = new Promise((resolve, reject) => {
      function onData(data: Buffer) {
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
  });
  return Promise.all(promises);
}
