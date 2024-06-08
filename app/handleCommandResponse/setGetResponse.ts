import * as net from 'net';
import {
  bulkString,
  escapeSymbols,
  nullBulkString,
} from '../constants/constants';
import { getValueByKeyInStore } from '../getValueByKeyInStore';

export function setGetResponse(key: string, connection: net.Socket) {
  const data = getValueByKeyInStore(key);

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
