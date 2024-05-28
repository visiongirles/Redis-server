import * as net from 'net';
import { setPingResponse } from './setPingResponse';
import { getInfoReplicationResponse } from './getInfoReplicationResponse';
import {
  bulkString,
  escapeSymbols,
  nullBulkString,
  simpleString,
} from './constants/constants';
import { store } from './constants/store';
import { setPsyncResponse } from './setPsyncResponse';
import { setRDBfileResponse } from './setRDBfileResponse';
import { isMasterServer } from './isMasterServer';
import { replicasList } from './constants/replicasList';
import { propagateCommandToReplicas } from './propagateCommandToReplicas';
import { configPath, serverInfo } from './constants/config';
import { getAck } from './getAck';
import { setRESPArray } from './setRESPArray';
import { parseRDBfile } from './parseRDBfile';
import { setStore } from './setStore';

export async function handleCommand(
  data: Buffer,
  command: string,
  commandArguments: string[],
  connection: net.Socket
) {
  switch (command) {
    case 'PING': {
      setPingResponse(connection);
      break;
    }
    case 'ECHO': {
      //все кроме команды склеить в строку
      const echo = commandArguments[1];

      const data =
        bulkString + echo.length + escapeSymbols + echo + escapeSymbols;

      connection.write(data);
      break;
    }
    case 'SET': {
      const key = commandArguments[1];
      const value = commandArguments[2];
      console.log('[SET] role of server: ', serverInfo.role);

      // check if there are any OPTIONS
      const minimumOptions = 4;
      if (commandArguments.length < minimumOptions) {
        // if no OPTIONS
        store.set(key, { value: value, timeToLive: null });
        if (isMasterServer()) {
          const response = simpleString + 'OK' + escapeSymbols;
          connection.write(response);
          propagateCommandToReplicas(data);
          serverInfo.master_repl_offset += data.length;
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
        // console.log('[SET] key: ', key, ' value: ', store.get(key));

        if (isMasterServer()) {
          const response = simpleString + 'OK' + escapeSymbols;
          connection.write(response);
          propagateCommandToReplicas(data);
          serverInfo.master_repl_offset += data.length;

          // отправить всем репликам
        }
      }
      break;
    }
    case 'GET': {
      console.log('INSIDE GET');
      const key = commandArguments[1];
      console.log('key', key);

      // check expiry
      const data = store.get(key);
      console.log('data: ', data);
      if (!data) {
        console.log('[GET]: no key');
        connection.write(nullBulkString);
        break;
      }

      const expiry = data.timeToLive;

      if (expiry) {
        const isExpired = expiry < Date.now();

        if (isExpired) {
          store.delete(key);
          console.log('[GET]: expired key');

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
    case 'INFO': {
      let options = commandArguments[1];
      // console.log('INFO argument is :', options);

      switch (options) {
        case 'replication': {
          const response = getInfoReplicationResponse();
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

    case 'PSYNC': {
      const response = setPsyncResponse();
      connection.write(response);

      const rdb = setRDBfileResponse();
      connection.write(rdb);

      replicasList.add(connection);

      // const replconfGetack = `*3\r\n$8\r\nREPLCONF\r\n$6\r\nGETACK\r\n`;
      // connection.write(replconfGetack);
      break;
    }

    case 'REPLCONF': {
      let options = commandArguments[1];

      switch (options) {
        case 'GETACK': {
          const response = `*3\r\n$8\r\nREPLCONF\r\n$3\r\nACK\r\n$${
            serverInfo.master_repl_offset.toString().length
          }\r\n${serverInfo.master_repl_offset}\r\n`;
          connection.write(response);
          console.log(`[GETACK response: ]`, response);
          break;
        }
        case 'listening-port':
        case 'capa': {
          connection.write('+OK' + escapeSymbols);
          break;
        }
        default: {
        }
      }
      break;
    }
    case 'WAIT': {
      // const countFromArgument = Number(commandArguments[1]);
      const timeout = Number(commandArguments[2]);
      // const count = listOfReplicas.size;
      const data = `*3\r\n$8\r\nREPLCONF\r\n$6\r\nGETACK\r\n$1\r\n*\r\n`;

      try {
        const responses = await getAck(data, timeout);

        const numberOfAliveReplicas = responses.filter(
          (response) => response.toString() !== `replica is dead`
        );

        const response =
          serverInfo.master_repl_offset === 0
            ? replicasList.size
            : numberOfAliveReplicas.length;

        console.log(`Active replicas count: `, numberOfAliveReplicas.length);
        // const count =
        //   responses.length > countFromArgument
        //     ? countFromArgument
        //     : responses.length;

        // propagateCommandToReplicas(data);
        connection.write(`:${response}` + escapeSymbols);
      } catch (error) {
        console.log('[ERROR from WAIT getAck()]: ', error);
      }

      //TODO: проверка на количество байт в offset
      // serverInfo.master_repl_offset === ответ от реплики

      break;
    }
    case 'CONFIG': {
      const option = commandArguments[1];
      switch (option) {
        case 'GET': {
          const argument: string = commandArguments[2];
          const response = setRESPArray(argument, configPath[argument]);
          connection.write(response);
          break;
        }
      }
      break;
    }
    case 'KEYS': {
      const rdb = parseRDBfile(configPath.dir, configPath.dbfilename);
      const keysIterator = rdb.hashmap.keys();
      const firstKey = keysIterator.next().value;
      const response = setRESPArray(firstKey);
      setStore(rdb.hashmap);
      connection.write(response);
      break;
    }
    default: {
      connection.write('+OK' + escapeSymbols);
    }
  }
}
