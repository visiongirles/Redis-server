import * as net from 'net';
import { bulkString, escapeSymbols } from '../constants/constants';

export function setEchoResponse(echo: string, connection: net.Socket) {
  const response =
    bulkString + echo.length + escapeSymbols + echo + escapeSymbols;
  connection.write(response);
}
