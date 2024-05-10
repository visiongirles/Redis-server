import * as net from 'net';
import { serverInfo } from './config';
import { bulkString, escapeSymbols, simpleString } from './constants';

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

export function createReplica() {
  const indexOfReplicaFlag = process.argv.indexOf('--replicaof');

  console.log('indexOfReplicaFlag: ', indexOfReplicaFlag);
  console.log('process.argv: ', process.argv);

  if (indexOfReplicaFlag !== -1) {
    serverInfo.role = 'slave';

    const masterHost = process.argv[indexOfReplicaFlag + 1];
    const masterPort = Number(process.argv[indexOfReplicaFlag + 2]);
    console.log('masterHost: ', masterHost);
    console.log('masterPort: ', masterPort);

    const slaveClient = net.createConnection(masterPort, masterHost, () => {});
    handshakeProcess(slaveClient);

    slaveClient.on('data', (data: string | Buffer) => {
      const respond = data.toString();
      console.log('Respond from master: ', respond, ' END | ');
    });
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

function handshakeProcess(slaveClient: net.Socket) {
  const ping = '*1\r\n$4\r\nPING\r\n';
  slaveClient.write(ping);

  const replicaConfigFirst =
    '*3\r\n$8\r\nREPLCONF\r\n$14\r\nlistening-port\r\n$4\r\n6380\r\n';
  setTimeout(() => {
    slaveClient.write(replicaConfigFirst);
  }, 100);

  const replicaConfigSecond =
    '*3\r\n$8\r\nREPLCONF\r\n$4\r\ncapa\r\n$6\r\npsync2\r\n';

  setTimeout(() => {
    slaveClient.write(replicaConfigSecond);
  }, 100);
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

export function pongCommand() {
  console.log('Pong');
}
