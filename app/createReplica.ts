import * as net from 'net';
import { serverInfo } from './config';

export function createReplica(): net.Socket | null {
  const indexOfReplicaFlag = process.argv.indexOf('--replicaof');

  // console.log('indexOfReplicaFlag: ', indexOfReplicaFlag);
  // console.log('process.argv: ', process.argv);

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

    // console.log('masterHost: ', masterHost);
    // console.log('masterPort: ', masterPort);

    return net.createConnection(masterPort, masterHost, () => {});
  }

  return null;
}
