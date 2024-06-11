import * as net from 'net';
import { StoreValue, StoreValueType } from '../constants/store';
import { setKeyValueToStore } from '../setKeyValueToStore';
import { isMasterServer } from '../isMasterServer';
import { escapeSymbols, simpleString } from '../constants/constants';

export function setSetResponse(
  commandOptions: string[],
  connection: net.Socket
) {
  const key = commandOptions[0];
  const value = commandOptions[1];

  const storeValue: StoreValue = {
    value: value,
    timeToLive: null,
    type: StoreValueType.String,
  };

  if (hasAdditionalOptions(commandOptions)) {
    const options = commandOptions[2];
    if (options === 'px') {
      const expiry = Number(commandOptions[3]);
      const timeToLive = Date.now() + expiry;

      storeValue.timeToLive = timeToLive;
    }
  }
  setKeyValueToStore(key, storeValue);

  if (isMasterServer()) {
    const response = simpleString + 'OK' + escapeSymbols;
    connection.write(response);
  }
}

function hasAdditionalOptions(commandOptions: string[]) {
  const minimumOptions = 2;
  return commandOptions.length > minimumOptions;
}
