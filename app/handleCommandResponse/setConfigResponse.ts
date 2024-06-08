import * as net from 'net';
import { setRESPArray } from '../setRESPArray';
import { configPath } from '../constants/config';

export function setConfigResponse(
  commandOptions: string[],
  connection: net.Socket
) {
  const option = commandOptions[0];
  switch (option) {
    case 'GET': {
      const argument: string = commandOptions[1];
      const response = setRESPArray(argument, configPath[argument]);
      connection.write(response);
      break;
    }
  }
}
