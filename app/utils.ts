import * as net from 'net';
import { serverInfo } from './config';
import { bulkString, escapeSymbols, simpleString } from './constants';

export function isArgumentHasEnoughLength(argument: any, size: number) {
  if (argument.length < size) {
    throw Error("Request isn't correct. No enough arguments in type of data");
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

export function createReplica(connection: net.Socket) {
  const indexOfReplicaFlag = process.argv.indexOf('--replicaof');

  console.log('indexOfReplicaFlag: ', indexOfReplicaFlag);
  console.log('process.argv: ', process.argv);

  if (indexOfReplicaFlag !== -1) {
    serverInfo.role = 'slave';

    const masterHost = process.argv[indexOfReplicaFlag + 1];
    const masterPort = process.argv[indexOfReplicaFlag + 2];
    console.log('masterHost: ', masterHost);
    console.log('masterPort: ', masterPort);

    handshakeProcess(connection);
  }
}

export function setUpPort() {
  const indexOfPortFlag = process.argv.indexOf('--port');

  let port = 6379;

  if (indexOfPortFlag !== -1 && process.argv[indexOfPortFlag + 1]) {
    port = Number(process.argv[indexOfPortFlag + 1]);
  }
  return port;
}

export function isCommandHasNoOptions(argument: any) {
  return argument === '';
}

function handshakeProcess(connection: net.Socket) {
  pingCommand(connection);
}

export function infoReplicationResponse() {
  // const jsonString = JSON.stringify(serverInfo);
  // const response = jsonString.replace(/,/g, customDelimiter);

  const serverInfoString = JSON.stringify(serverInfo)
    .replaceAll(/["{}]/g, '')
    .replaceAll(/,/g, escapeSymbols)
    .replaceAll(/null/g, '');

  const response =
    bulkString +
    serverInfoString.length +
    escapeSymbols +
    serverInfoString +
    escapeSymbols;

  return response;
}

export function pingCommand(connection: net.Socket) {
  connection.write(simpleString + 'PONG' + escapeSymbols);
}
