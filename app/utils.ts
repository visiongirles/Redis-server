import * as net from 'net';
import { escapeSymbols, simpleString } from './constants';

export function isArgumentHasEnoughLength(argument: any, size: number) {
  if (argument.length < size) {
    const message =
      "Request isn't correct. No enough arguments in type of data. Argument: " +
      argument +
      ', size: ' +
      size;
    throw Error(message);
  }
  return;
}

export function isArray(token: string) {
  if (token !== '*') {
    const errorText = 'Incorrect token. Expected *, but received: ' + token;
    throw new Error(errorText);
  }
  return;
}

export function isCommandHasNoOptions(argument: any) {
  return argument === '';
}

export function pingCommand(connection: net.Socket) {
  connection.write(simpleString + 'PONG' + escapeSymbols);
}

export function pongCommand() {
  console.log('Pong');
}
