import * as net from 'net';

import { getInfoReplicationResponse } from '../getInfoReplicationResponse';

export function setInfoResponse(
  commandOptions: string[],
  connection: net.Socket
) {
  let options = commandOptions[0];

  switch (options) {
    case 'replication': {
      const response = getInfoReplicationResponse();
      connection.write(response);
      break;
    }
    default: {
      console.log(
        '[Error] Default of switch for options. NO implementation done yet for the options: ]',
        options
      );
    }
  }
}
