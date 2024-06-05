import * as net from 'net';
import { setPingResponse } from './setPingResponse';
import { getInfoReplicationResponse } from './getInfoReplicationResponse';
import { bulkString, escapeSymbols, simpleString } from './constants/constants';
import { StoreValueType, store } from './constants/store';
import { Stream, streamStore } from './constants/streamStore';
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
import { setGetResponse } from './setGetResponse';
import { getValueByKeyStore } from './getValueByKeyStore';
import { setXADDResponse } from './setXADDResponse';
import {
  validateStreamId,
  isStreamIdEqualsDefault,
  parseStreamId,
  setStreamIdToString,
} from './validateStreamId';
import { getValueByKeyStreamStore } from './getValueByKeyStreamStore';
import { setStreamId } from './setStreamId';

export async function handleCommand(
  data: Buffer,
  command: string,
  commandOptions: string[],
  connection: net.Socket
) {
  switch (command) {
    case 'PING': {
      setPingResponse(connection);
      break;
    }
    case 'ECHO': {
      //все кроме команды склеить в строку
      const echo = commandOptions[0];

      const data =
        bulkString + echo.length + escapeSymbols + echo + escapeSymbols;

      connection.write(data);
      break;
    }
    case 'SET': {
      const key = commandOptions[0];
      const value = commandOptions[1];
      console.log('[SET] role of server: ', serverInfo.role);

      // check if there are any OPTIONS
      const minimumOptions = 4;
      if (commandOptions.length < minimumOptions) {
        // if no OPTIONS
        store.set(key, {
          value: value,
          timeToLive: null,
          type: StoreValueType.String,
        });

        if (isMasterServer()) {
          const response = simpleString + 'OK' + escapeSymbols;
          connection.write(response);
          propagateCommandToReplicas(data);
          serverInfo.master_repl_offset += data.length;
          // отправить всем репликам
        }
        break;
      }

      const options = commandOptions[2];
      // console.log('options: ', options);
      if (options === 'px') {
        // shift to the next array element

        const expiry = Number(commandOptions[3]);

        const timeToLive = Date.now() + expiry;
        store.set(key, {
          value: value,
          timeToLive: timeToLive,
          type: StoreValueType.String,
        });
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
      setGetResponse(commandOptions[0], connection);
      break;
    }
    case 'INFO': {
      let options = commandOptions[0];
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
      let options = commandOptions[0];
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
      const timeout = Number(commandOptions[1]);
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
      const option = commandOptions[0];
      switch (option) {
        case 'GET': {
          const argument: string = commandOptions[1];
          const response = setRESPArray(argument, configPath[argument]);
          connection.write(response);
          break;
        }
      }
      break;
    }
    case 'KEYS': {
      // const option = commandArguments[1];
      // console.log('[KEYS] option: ', option);
      // if (option === '*') {

      // }
      const rdb = parseRDBfile(configPath.dir, configPath.dbfilename);
      const keysIterator = Array.from(rdb.store.keys());
      // const firstKey = keysIterator.next().value;
      const response = setRESPArray(...keysIterator);
      setStore(rdb.store);
      connection.write(response);
      break;
    }
    case 'XADD': {
      const [key, id, newStreamKey, newStreamValue] = commandOptions;

      // console.log(
      //   '[XADD] stream-key, id, key, value: ',
      //   key,
      //   id,
      //   newStreamKey,
      //   newStreamValue
      // );

      const value = getValueByKeyStreamStore(key);

      let streamId = id;

      if (id === '*') {
        streamId = setStreamId();
      }

      const parsedStreamId = parseStreamId(streamId);

      if (!value) {
        let newId = parsedStreamId;
        if (parsedStreamId.count === '*') {
          newId.count = parsedStreamId.timestamp === '0' ? '1' : '0';
        }
        const stream: Stream = {
          id: newId,
          key: newStreamKey,
          value: newStreamValue,
        };
        streamStore.set(key, [stream]);
        setXADDResponse(setStreamIdToString(newId), connection);
        break;
      }

      if (parsedStreamId.count === '*') {
        let newId = parsedStreamId;
        newId.count = '0';

        for (let item of value) {
          if (item.id.timestamp === newId.timestamp) {
            newId.count = String(Number(item.id.count) + 1);
            break;
          }
        }

        const stream: Stream = {
          id: newId,
          key: newStreamKey,
          value: newStreamValue,
        };

        const updatedValue = [...value, stream];
        streamStore.set(key, updatedValue);
        setXADDResponse(setStreamIdToString(newId), connection);
        break;
      }

      if (isStreamIdEqualsDefault(parsedStreamId)) {
        const error = `-ERR The ID specified in XADD must be greater than 0-0\r\n`;
        connection.write(error);
        break;
      }

      if (validateStreamId(parsedStreamId, value)) {
        const stream: Stream = {
          id: streamId,
          key: newStreamKey,
          value: newStreamValue,
        };
        // value.push(stream); //
        const updatedValue = [...value, stream];
        streamStore.set(key, updatedValue);
        setXADDResponse(setStreamIdToString(parsedStreamId), connection);
        break;
      }
      const error = `-ERR The ID specified in XADD is equal or smaller than the target stream top item\r\n`;
      connection.write(error);
      break;
    }
    case 'TYPE': {
      console.log('[handleCommand TYPE] key:', commandOptions[0]);
      // if (streamStore.get(commandOptions[0])) {
      //   connection.write('+stream\r\n');
      //   break;
      // }

      const stream = getValueByKeyStreamStore(commandOptions[0]);

      if (stream) {
        connection.write('+stream\r\n');
        break;
      }

      const value = getValueByKeyStore(commandOptions[0]);
      if (value) {
        console.log('[GET] chceking the value:', value);
        switch (value.type) {
          // case 'object': {
          //   connection.write('+stream\r\n');
          //   break;
          // }
          case StoreValueType.String: {
            connection.write('+string\r\n');
            break;
          }

          default: {
            const notImplementedType = typeof value;
            throw Error(
              `[TYPE command], TYPE ${notImplementedType} not implement`
            );
          }
        }
      }

      connection.write('+none\r\n');
      break;
    }
    default: {
      console.log('[handleCommand] default case:with command', command);
      connection.write('+OK' + escapeSymbols);
    }
  }
}
