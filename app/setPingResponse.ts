import * as net from 'net';
import { escapeSymbols, simpleString } from './constants/constants';

export function setPingResponse(connection: net.Socket) {
  const reponse = simpleString + 'PONG' + escapeSymbols;
  connection.write(reponse);
}
