import * as net from 'net';
import { createReplica } from './createReplica';
import { setUpPort } from './setUpPort';
import { parseBuffer } from './parseBuffer';
import { handleCommand } from './handleCommand';
import { clearBuffer } from './clearBuffer';
import { isMasterServer } from './isMasterServer';
import { serverInfo } from './config';

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
      const isSuccess: boolean = result[0];
      // console.log(
      //   '[Buffer AFTER parsing]:',
      //   buffer.toString().replaceAll('\r\n', ' ')
      // );
      if (!isSuccess) break;

      const commandAndArguments: string[] = result[1];
      const command = commandAndArguments[0];
      const offset = result[2];

      const dataForReplica = buffer.subarray(0, offset);

      console.log(
        '[Master Buffer]: ',
        buffer.toString().replaceAll('\r\n', '\\r\\n')
      );
      console.log(
        '[data for replica]: ',
        dataForReplica.toString().replaceAll('\r\n', '\\r\\n')
      );
      handleCommand(dataForReplica, command, commandAndArguments, connection);
      // serverInfo.master_repl_offset += offset;
      buffer = clearBuffer(buffer, offset);

      console.log("End of 'data' event");
    }

    // }
  });

  connection.on('end', () => {
    console.log('Inside Event "end"');
  });
});

server.listen(setUpPort(), '127.0.0.1');

server.on('listening', () => {
  // console.log('connection from Listening event: ', connection);
  console.log('Server is running');
  createReplica();
});

server.on('error', (error: Error) => {
  console.log(`[error event]: `, error);
});
// *1\r\n$4\r\nping\r\n
// *2\r\n$4\r\necho\r\n$3\r\nhey\r\n
