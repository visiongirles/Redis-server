import { serverInfo } from './config';
import { bulkString, escapeSymbols } from './constants';

export function infoReplicationResponse() {
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
