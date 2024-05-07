import { serverInfo } from './config';

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

export function createReplica() {
  const indexOfPortFlag = process.argv.indexOf('--replicaof');

  if (indexOfPortFlag !== -1) {
    serverInfo.role = 'slave';
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
