import * as net from 'net';
import { bulkString, escapeSymbols } from './constants/constants';

export function setXADDResponse(id: string, connection: net.Socket) {
  const reponse = bulkString + id.length + escapeSymbols + id + escapeSymbols;
  connection.write(reponse);
}
