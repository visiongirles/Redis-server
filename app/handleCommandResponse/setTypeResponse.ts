import * as net from 'net';
import { getValueByKeyInStreamStore } from '../getValueByKeyInStreamStore';
import { StoreValueType } from '../constants/store';
import { getValueByKeyInStore } from '../getValueByKeyInStore';

export function setTypeResponse(
  commandOptions: string[],
  connection: net.Socket
) {
  const stream = getValueByKeyInStreamStore(commandOptions[0]);

  if (stream) {
    connection.write('+stream\r\n');
    return;
  }

  const value = getValueByKeyInStore(commandOptions[0]);
  if (value) {
    switch (value.type) {
      case StoreValueType.String: {
        connection.write('+string\r\n');
        return;
      }

      default: {
        const notImplementedType = typeof value;
        throw Error(`[TYPE command], TYPE ${notImplementedType} not implement`);
      }
    }
  }
  connection.write('+none\r\n');
}
