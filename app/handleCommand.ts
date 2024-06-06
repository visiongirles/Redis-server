import * as net from 'net';
import { setPingResponse } from './setPingResponse';
import { getInfoReplicationResponse } from './getInfoReplicationResponse';
import { bulkString, escapeSymbols, simpleString } from './constants/constants';
import { StoreValueType, store } from './constants/store';
import { StreamId, StreamValue, streamStore } from './constants/streamStore';
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
import { setStreamValue } from './setStreamValue';
import { mergeMaps } from './mergeMap';
import { getStreamValuesByRange } from './getStreamValuesByRange';

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
      const streamKey = commandOptions[0];
      let streamId = commandOptions[1];
      const arrayOfKeysAndValues = commandOptions.slice(
        2,
        commandOptions.length
      );

      // console.log(
      //   '[XADD] stream-key, id, key, value: ',
      //   key,
      //   id,
      //   newStreamKey,
      //   newStreamValue
      // );

      const streamValue = getValueByKeyStreamStore(streamKey);

      if (streamId === '*') {
        streamId = setStreamId();
      }

      let parsedStreamId = parseStreamId(streamId);

      if (!streamValue) {
        if (parsedStreamId.count === '*') {
          parsedStreamId.count = parsedStreamId.timestamp === '0' ? '1' : '0';
        }
        // TODO: setStreamStore - check if I've already had such funct and refactor
        const newStreamValue = setStreamValue(
          parsedStreamId,
          arrayOfKeysAndValues
        );

        streamStore.set(streamKey, newStreamValue);
        setXADDResponse(setStreamIdToString(parsedStreamId), connection);
        break;
      }

      if (parsedStreamId.count === '*') {
        parsedStreamId.count = '0';

        // increment id.count if there are some items with the same timestamp
        for (let currentStreamId of streamValue.keys()) {
          if (currentStreamId.timestamp === parsedStreamId.timestamp) {
            parsedStreamId.count = String(Number(currentStreamId.count) + 1);
            break;
          }
        }
        const newStreamValue = setStreamValue(
          parsedStreamId,
          arrayOfKeysAndValues
        );

        const updatedValue = mergeMaps(streamValue, newStreamValue);
        streamStore.set(streamKey, updatedValue);
        setXADDResponse(setStreamIdToString(parsedStreamId), connection);
        break;
      }

      if (isStreamIdEqualsDefault(parsedStreamId)) {
        const error = `-ERR The ID specified in XADD must be greater than 0-0\r\n`;
        connection.write(error);
        break;
      }

      if (validateStreamId(parsedStreamId, streamValue)) {
        const newStreamValue = setStreamValue(
          parsedStreamId,
          arrayOfKeysAndValues
        );

        const updatedValue = mergeMaps(streamValue, newStreamValue);
        streamStore.set(streamKey, updatedValue);
        setXADDResponse(setStreamIdToString(parsedStreamId), connection);
        break;
      }
      const error = `-ERR The ID specified in XADD is equal or smaller than the target stream top item\r\n`;
      connection.write(error);
      break;
    }
    case 'XRANGE': {
      const [streamKey, startIndex, endIndex] = commandOptions;
      const streamValueInRange = getStreamValuesByRange(
        streamKey,
        startIndex,
        endIndex
      );
      if (!streamValueInRange) {
        console.log('streamValueInRange ===', streamValueInRange);
        throw Error(
          `[XRANGE] no value by key ${streamKey} between ${startIndex} and ${endIndex}`
        );
      }
      let response = '';
      // const outerArrayString = Array.from(streamValueInRange.keys()).length;
      const outerArrayString = streamValueInRange.size;
      response = '*' + outerArrayString + escapeSymbols;
      for (const [
        streamId,
        keyValuePairArray,
      ] of streamValueInRange.entries()) {
        let innerArray: string[] = [];

        for (const keyValuePair of keyValuePairArray) {
          innerArray.push(keyValuePair.key);
          innerArray.push(String(keyValuePair.value));
        }
        const innerArrayString = setRESPArray(...innerArray);
        response += setRESPArray(setStreamIdToString(streamId));
        response += innerArrayString;
      }
      connection.write(response);

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
