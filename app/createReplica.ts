import * as net from 'net';
import { serverInfo } from './config';
import { handshakeProcess } from './handshakeProcess';
import { parseBuffer } from './parseBuffer';
import { handleCommand } from './handleCommand';
import { clearBuffer } from './clearBuffer';
import { receiveRDBfile } from './receiveRDBfile';

export async function createReplica() {
  const indexOfReplicaFlag = process.argv.indexOf('--replicaof');

  console.log('indexOfReplicaFlag: ', indexOfReplicaFlag);
  console.log('process.argv: ', process.argv);

  if (indexOfReplicaFlag !== -1) {
    serverInfo.role = 'slave';

    let masterHost = '';
    let masterPort = 0;

    const indexOfWhitespace = process.argv[indexOfReplicaFlag + 1].indexOf(' ');
    if (indexOfWhitespace !== -1) {
      masterHost = process.argv[indexOfReplicaFlag + 1].substring(
        0,
        indexOfWhitespace
      );
      const lastIndex = process.argv[indexOfReplicaFlag + 1].length;
      masterPort = Number(
        process.argv[indexOfReplicaFlag + 1].substring(
          indexOfWhitespace + 1,
          lastIndex
        )
      );
    } else {
      masterHost = process.argv[indexOfReplicaFlag + 1];
      masterPort = Number(process.argv[indexOfReplicaFlag + 2]);
    }

    console.log('masterHost: ', masterHost);
    console.log('masterPort: ', masterPort);

    const slaveClient = net.createConnection(masterPort, masterHost, () => {});
    await handshakeProcess(slaveClient);

    let clientBuffer: Buffer = Buffer.alloc(0);

    slaveClient.on('data', (data: Buffer) => {
      clientBuffer = Buffer.concat([clientBuffer, data]);

      clientBuffer = receiveRDBfile(data, clientBuffer);

      while (clientBuffer.length > 0) {
        console.log(
          '[Replica buffer]: ',
          clientBuffer.toString().replaceAll('\r\n', '\\r\\n')
        );

        const result = parseBuffer(clientBuffer);
        console.log('[Replica parse result]: ', result);
        const isSuccess: boolean = result[0];
        if (!isSuccess) break;

        const commandAndArguments: string[] = result[1];
        const command = commandAndArguments[0];
        const offset = result[2];
        if (command === 'get' || command === 'set') {
          handleCommand(data, command, commandAndArguments, slaveClient);
        }
        clientBuffer = clearBuffer(clientBuffer, offset);
      }
    });
  }
}
