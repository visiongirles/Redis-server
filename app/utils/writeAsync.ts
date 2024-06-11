import * as net from 'net';

export function writeAsync(
  data: string,
  connection: net.Socket
): Promise<Buffer> {
  connection.write(data);

  const promise: Promise<Buffer> = new Promise((resolve, reject) => {
    function onData(data: Buffer) {
      resolve(data);
      connection.removeListener('data', onData);
    }

    function onError(error: Error) {
      reject(error);
    }

    connection.on('data', onData);
    connection.on('error', onError);
  });

  return promise;
}
