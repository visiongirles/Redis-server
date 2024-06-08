import * as net from 'net';
import { escapeSymbols } from './constants/constants';
import { streamStore } from './constants/streamStore';
import { isMasterServer } from './isMasterServer';
import { replicasList } from './constants/replicasList';
import { propagateCommandToReplicas } from './propagateCommandToReplicas';
import {
  validateStreamId,
  isStreamIdEqualsDefault,
  parseStreamId,
  setStreamIdToString,
} from './validateStreamId';
import { getValueByKeyInStreamStore } from './getValueByKeyInStreamStore';
import { setStreamId } from './setStreamId';
import { setStreamValue } from './setStreamValue';
import { mergeMaps } from './utils';
import {
  setPingResponse,
  setRDBfileResponse,
  setPsyncResponse,
  setGetResponse,
  setXaddResponse,
  setEchoResponse,
  setSetResponse,
  setInfoResponse,
  setReplconfResponse,
  setWaitResponse,
  setConfigResponse,
  setXrangeResponse,
  setXReadResponse,
  setKeysResponse,
  setTypeResponse,
} from './handleCommandResponse';
import { updateMasterServerOffset } from './updateMasterServerOffset';
import { StreamId } from './constants/streamStore';

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
      setEchoResponse(commandOptions[0], connection);
      break;
    }
    case 'SET': {
      setSetResponse(commandOptions, connection);

      if (isMasterServer()) {
        propagateCommandToReplicas(data);
        updateMasterServerOffset(data.length);
      }

      break;
    }
    case 'GET': {
      setGetResponse(commandOptions[0], connection);
      break;
    }
    case 'INFO': {
      setInfoResponse(commandOptions, connection);
      break;
    }

    case 'PSYNC': {
      setPsyncResponse(connection);
      setRDBfileResponse(connection);

      replicasList.add(connection);
      break;
    }

    case 'REPLCONF': {
      setReplconfResponse(commandOptions, connection);
      break;
    }
    case 'WAIT': {
      setWaitResponse(commandOptions, connection);

      //TODO: проверка на количество байт в offset
      // serverInfo.master_repl_offset === ответ от реплики
      break;
    }
    case 'CONFIG': {
      setConfigResponse(commandOptions, connection);
      break;
    }
    case 'KEYS': {
      setKeysResponse(connection);
      break;
    }
    case 'XADD': {
      const streamKey = commandOptions[0];
      let streamId = commandOptions[1];
      const arrayOfKeysAndValues = commandOptions.slice(
        2,
        commandOptions.length
      );

      const streamValue = getValueByKeyInStreamStore(streamKey);

      if (isStreamIdWithoutCount(streamId)) {
        streamId = setStreamId();
      }

      let parsedStreamId = parseStreamId(streamId);

      if (!streamValue) {
        if (isParsedStreamIdWithoutCount(parsedStreamId)) {
          parsedStreamId.count = setParsedStreamIdCount(parsedStreamId);
        }
        // TODO: setStreamStore - check if I've already had such funct and refactor
        const newStreamValue = setStreamValue(
          parsedStreamId,
          arrayOfKeysAndValues
        );

        streamStore.set(streamKey, newStreamValue);
        setXaddResponse(setStreamIdToString(parsedStreamId), connection);
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
        setXaddResponse(setStreamIdToString(parsedStreamId), connection);
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
        setXaddResponse(setStreamIdToString(parsedStreamId), connection);
        break;
      }
      const error = `-ERR The ID specified in XADD is equal or smaller than the target stream top item\r\n`;
      connection.write(error);
      break;
    }
    case 'XRANGE': {
      setXrangeResponse(commandOptions, connection);

      break;
    }
    case 'XREAD': {
      // const reservedLeyWordStreams = commandOptions[0];
      // setXReadResponse(commandOptions, connection);
      setXReadResponse(commandOptions, connection);
      // connection.write(response);
      break;
    }
    case 'TYPE': {
      setTypeResponse(commandOptions, connection);
      break;
    }
    default: {
      console.log('[handleCommand] default case with command', command);
      connection.write('+OK' + escapeSymbols);
    }
  }
}

export function isParsedStreamIdWithoutCount(
  parsedStreamId: StreamId
): boolean {
  return parsedStreamId.count === '*';
}

export function isStreamIdWithoutCount(streamId: string): boolean {
  return streamId === '*';
}

export function setParsedStreamIdCount(parsedStreamId: StreamId): string {
  return parsedStreamId.timestamp === '0' ? '1' : '0';
}
