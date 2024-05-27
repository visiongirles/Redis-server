import * as net from 'net';
import { serverInfo } from './constants/config';

export function setReplica(): net.Socket | null {
  const indexOfReplicaFlag = process.argv.indexOf('--replicaof');

  if (indexOfReplicaFlag !== -1) {
    serverInfo.role = 'slave';

    let masterHost = '';
    let masterPort = 0;

    // If host and port received as one argument
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
      // If host and port received as two separate arguments
      masterHost = process.argv[indexOfReplicaFlag + 1];
      masterPort = Number(process.argv[indexOfReplicaFlag + 2]);
    }

    return net.createConnection(masterPort, masterHost, () => {});
  }

  return null;
}
