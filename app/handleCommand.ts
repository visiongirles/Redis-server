import * as net from 'net';
import { escapeSymbols } from './constants/constants';
import { isMasterServer } from './isMasterServer';
import { replicasList } from './constants/replicasList';
import { propagateCommandToReplicas } from './propagateCommandToReplicas';

import {
  setPingResponse,
  setRDBfileResponse,
  setPsyncResponse,
  setGetResponse,
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
  setXaddResponse,
} from './handleCommandResponse';
import { updateMasterServerOffset } from './updateMasterServerOffset';

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
      setXaddResponse(commandOptions, connection);
      break;
    }
    case 'XRANGE': {
      setXrangeResponse(commandOptions, connection);
      break;
    }
    case 'XREAD': {
      setXReadResponse(commandOptions, connection);
      break;
    }
    case 'TYPE': {
      setTypeResponse(commandOptions, connection);
      break;
    }
    default: {
      connection.write('+OK' + escapeSymbols);
    }
  }
}
