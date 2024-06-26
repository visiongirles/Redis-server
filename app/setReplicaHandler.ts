import * as net from 'net';
import { clearBuffer } from './utils/';
import { serverInfo } from './constants/config';
import { handleCommand } from './handleCommand';
import { parseBuffer } from './parseBuffer';
import { getRDBfile } from './getRDBfile';

export const setReplicaHandler = (replica: net.Socket) => {
  let replicaBuffer: Buffer = Buffer.alloc(0);
  replica.on('data', (data: Buffer) => {
    replicaBuffer = Buffer.concat([replicaBuffer, data]);

    replicaBuffer = getRDBfile(replicaBuffer);

    while (replicaBuffer.length > 0) {
      const result = parseBuffer(replicaBuffer);
      const isSuccess: boolean = result.isSuccess;
      if (!isSuccess) break;

      const commandOptions: string[] = result.options;
      const command = result.command;
      const offset = result.offset;
      if (command === 'GET' || command === 'SET' || command === 'REPLCONF') {
        handleCommand(data, command, commandOptions, replica);
      }

      serverInfo.master_repl_offset += offset;

      replicaBuffer = clearBuffer(replicaBuffer, offset);
    }
  });
};
