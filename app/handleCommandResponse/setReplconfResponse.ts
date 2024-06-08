import * as net from 'net';
import { serverInfo } from '../constants/config';
import { escapeSymbols } from '../constants/constants';

export function setReplconfResponse(
  commandOptions: string[],
  connection: net.Socket
) {
  let options = commandOptions[0];
  switch (options) {
    case 'GETACK': {
      const response = `*3\r\n$8\r\nREPLCONF\r\n$3\r\nACK\r\n$${
        serverInfo.master_repl_offset.toString().length
      }\r\n${serverInfo.master_repl_offset}\r\n`;
      connection.write(response);
      console.log(`[GETACK response: ]`, response);
      break;
    }
    case 'listening-port':
    case 'capa': {
      connection.write('+OK' + escapeSymbols);
      break;
    }
    default: {
      console.log('[setReplconfResponse] Default should stay empty');
      //   throw Error("[Reploconf] default hasn't been implemented");
    }
  }
}
