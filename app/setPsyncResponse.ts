import { serverInfo } from './constants/config';
import { simpleString, escapeSymbols } from './constants/constants';

export function setPsyncResponse() {
  const id = serverInfo.master_replid;
  const offset = serverInfo.master_repl_offset.toString();

  const response =
    simpleString + 'FULLRESYNC ' + id + ' ' + offset + escapeSymbols;

  return response;
}
