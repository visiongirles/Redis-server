import * as net from 'net';
import {
  bulkString,
  escapeSymbols,
  nullBulkString,
} from './constants/constants';
import { getValueByKey } from './getValueByKey';

export function setGetResponse(key: string, connection: net.Socket) {
  const value = getValueByKey(key);

  if (value === null) {
    connection.write(nullBulkString);
  } else {
    const respond = value
      ? bulkString +
        String(value).length +
        escapeSymbols +
        value +
        escapeSymbols
      : nullBulkString;
    connection.write(respond);
  }
}
