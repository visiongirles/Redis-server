import * as net from 'net';
import {
  bulkString,
  escapeSymbols,
  nullBulkString,
} from './constants/constants';
import { getValueByKeyStore } from './getValueByKeyStore';

export function setGetResponse(key: string, connection: net.Socket) {
  const data = getValueByKeyStore(key);

  if (data === null) {
    connection.write(nullBulkString);
  } else {
    const respond = data.value
      ? bulkString +
        String(data.value).length +
        escapeSymbols +
        data.value +
        escapeSymbols
      : nullBulkString;
    connection.write(respond);
  }
}
