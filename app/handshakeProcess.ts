import * as net from 'net';

//TODO: const reply = await writeAsync('message')
export async function handshakeProcess(slaveClient: net.Socket) {
  const ping = '*1\r\n$4\r\nPING\r\n';
  const replicaConfigFirst =
    '*3\r\n$8\r\nREPLCONF\r\n$14\r\nlistening-port\r\n$4\r\n6380\r\n';
  const replicaConfigSecond =
    '*3\r\n$8\r\nREPLCONF\r\n$4\r\ncapa\r\n$6\r\npsync2\r\n';
  const psync = `*3\r\n$5\r\nPSYNC\r\n$1\r\n?\r\n$2\r\n-1\r\n`;
  // slaveClient.write(ping);
  // slaveClient.write(replicaConfigFirst);
  // slaveClient.write(replicaConfigSecond);

  try {
    const replyToPing = await writeAsync(ping, slaveClient);
    console.log('[replyToPing]: ', replyToPing.toString());
    // slaveClient.end();

    const replyToConfigPartOne = await writeAsync(
      replicaConfigFirst,
      slaveClient
    );
    console.log('[replyToConfigPartOne]: ', replyToConfigPartOne.toString());
    // slaveClient.end();
    const replyToConfigPartTwo = await writeAsync(
      replicaConfigSecond,
      slaveClient
    );
    // slaveClient.end();
    console.log('[replyToConfigPartTwo]: ', replyToConfigPartTwo.toString());

    const replyToPsync = await writeAsync(psync, slaveClient);
    console.log(
      '[replyToPsync]: ',
      replyToPsync.toString().replaceAll('\r\n', '\\r\\n')
    );
  } catch (error) {}
}

function writeAsync(data: string, connection: net.Socket): Promise<Buffer> {
  connection.write(data);

  const promise: Promise<Buffer> = new Promise((resolve, reject) => {
    // console.log('Stage #1 Promise');
    function onData(data: Buffer) {
      // console.log('Stage #2 in on data event Promise');

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
