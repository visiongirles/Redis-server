import * as net from 'net';
import { setReplica } from './setReplica';
import { setPort } from './setPort';
import { parseBuffer } from './parseBuffer';
import { handleCommand } from './handleCommand';
import { clearBuffer } from './utils/clearBuffer';
import { handleHandshakeProcess } from './handleHandshakeProcess';
import { setReplicaHandler } from './setReplicaHandler';
import { setConfig } from './setConfig';

// Uncomment this block to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
  // Handle connection
  let buffer: Buffer = Buffer.alloc(0);

  connection.on('end', function () {
    console.log('client disconnected');
  });

  connection.on('data', (data: Buffer) => {
    buffer = Buffer.concat([buffer, data]);

    while (buffer.length > 0) {
      const result = parseBuffer(buffer);

      const isSuccess: boolean = result.isSuccess;

      if (!isSuccess) break;

      const commandOptions: string[] = result.options;
      const command = result.command.toLocaleUpperCase();
      const offset = result.offset;
      const dataForReplica = buffer.subarray(0, offset);

      handleCommand(dataForReplica, command, commandOptions, connection);
      buffer = clearBuffer(buffer, offset);
    }

    // }
  });

  connection.on('end', () => {
    console.log('Inside Event "end"');
  });
});

server.listen(setPort(), '127.0.0.1');

server.on('listening', async () => {
  console.log('Server is running');

  const replica = setReplica();
  if (replica !== null) {
    await handleHandshakeProcess(replica);

    setReplicaHandler(replica);
  }

  setConfig();
});

server.on('error', (error: Error) => {
  console.log(`[error event]: `, error);
});
