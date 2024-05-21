import * as net from 'net';
import { clearBuffer } from './clearBuffer';
import { serverInfo } from './config';
import { handleCommand } from './handleCommand';
import { parseBuffer } from './parseBuffer';
import { receiveRDBfile } from './receiveRDBfile';

export const setReplicaHandler = (slaveClient: net.Socket) => {
  let clientBuffer: Buffer = Buffer.alloc(0);
  slaveClient.on('data', (data: Buffer) => {
    clientBuffer = Buffer.concat([clientBuffer, data]);

    clientBuffer = receiveRDBfile(clientBuffer);

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
      if (command === 'GET' || command === 'SET' || command === 'REPLCONF') {
        handleCommand(data, command, commandAndArguments, slaveClient);
      }

      serverInfo.master_repl_offset += offset;

      clientBuffer = clearBuffer(clientBuffer, offset);
    }
  });
};
