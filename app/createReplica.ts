import * as net from 'net';
import { serverInfo } from './config';
import { handshakeProcess } from './handshakeProcess';

export function createReplica() {
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
    handshakeProcess(slaveClient);

    // slaveClient.on('data', (data: string | Buffer) => {
    //   const respond = data.toString();
    //   console.log('Respond from master: ', respond, ' END | ');
    // });
  }
}
