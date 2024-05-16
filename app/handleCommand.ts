import * as net from 'net';
import { pingCommand } from './utils';
import { infoReplicationResponse } from './infoReplicationResponse';
import {
  bulkString,
  escapeSymbols,
  nullBulkString,
  simpleString,
} from './constants';
import { store } from './store';
import { psyncResponse } from './psyncResponse';
import { createRDBfileResponse } from './createRDBfileResponse';
import { isMasterServer } from './isMasterServer';
import { listOfReplicas } from './listOfReplicas';
import { propagateCommandToReplicas } from './propagateCommandToReplicas';

export function handleCommand(
  data: Buffer,
  command: string,
  commandArguments: string[],
  connection: net.Socket
) {
  switch (command) {
    case 'ping': {
      pingCommand(connection);
      break;
    }
    case 'echo': {
      //все кроме команды склеить в строку
      const echo = commandArguments[1];

      const data =
        bulkString + echo.length + escapeSymbols + echo + escapeSymbols;

      connection.write(data);
      break;
    }
    case 'set': {
      const key = commandArguments[1];
      const value = commandArguments[2];

      // check if there are any OPTIONS
      const minimumOptions = 4;
      if (commandArguments.length < minimumOptions) {
        // if no OPTIONS
        store.set(key, { value: value, timeToLive: null });
        console.log('[SET] key: ', key, ' value: ', store.get(key));
        if (isMasterServer()) {
          const response = simpleString + 'OK' + escapeSymbols;
          connection.write(response);
          propagateCommandToReplicas(data);
          // отправить всем репликам
        }
        break;
      }

      const options = commandArguments[3];
      // console.log('options: ', options);
      if (options === 'px') {
        // shift to the next array element

        const expiry = Number(commandArguments[4]);

        const timeToLive = Date.now() + expiry;
        store.set(key, { value: value, timeToLive: timeToLive });
        console.log('[SET] key: ', key, ' value: ', store.get(key));

        if (isMasterServer()) {
          const response = simpleString + 'OK' + escapeSymbols;
          connection.write(response);
          propagateCommandToReplicas(data);
          // отправить всем репликам
        }
      }
      break;
    }
    case 'get': {
      const key = commandArguments[1];

      // check expiry
      const data = store.get(key);

      if (!data) {
        connection.write(nullBulkString);
        break;
      }

      const expiry = data.timeToLive;

      if (expiry) {
        const isExpired = expiry < Date.now();

        if (isExpired) {
          store.delete(key);
          connection.write(nullBulkString);
          break;
        }
      }

      const value = data.value;

      const respond = value
        ? bulkString + value.length + escapeSymbols + value + escapeSymbols
        : nullBulkString;
      connection.write(respond);

      break;
    }
    case 'info': {
      let options = commandArguments[1];
      // console.log('INFO argument is :', options);

      switch (options) {
        case 'replication': {
          const response = infoReplicationResponse();
          connection.write(response);
          break;
        }
        default: {
          console.log(
            '[Error] Default of switch for options. NO implementation done yet for the options: ]',
            options
          );
          break;
        }
      }

      break;
    }

    case 'psync': {
      const response = psyncResponse();
      connection.write(response);

      const rdb = createRDBfileResponse();
      connection.write(rdb);

      listOfReplicas.add(connection);

      break;
    }
    default: {
      connection.write('+OK' + escapeSymbols);
    }
  }
}
