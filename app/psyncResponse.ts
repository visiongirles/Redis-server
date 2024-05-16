import { serverInfo } from './config';
import { simpleString, escapeSymbols } from './constants';

export function psyncResponse() {
  const id = serverInfo.master_replid;
  const offset = serverInfo.master_repl_offset.toString();

  const response =
    simpleString + 'FULLRESYNC ' + id + ' ' + offset + escapeSymbols;

  return response;
}
