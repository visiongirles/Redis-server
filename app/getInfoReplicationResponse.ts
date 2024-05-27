import { serverInfo } from './constants/config';
import { bulkString, escapeSymbols } from './constants/constants';

export function getInfoReplicationResponse() {
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
