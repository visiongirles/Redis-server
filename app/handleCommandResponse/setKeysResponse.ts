import * as net from 'net';
import { parseRDBfile } from '../parseRDBfile';
import { configPath } from '../constants/config';
import { setRESPArray } from '../setRESPArray';
import { setStore } from '../setStore';

export function setKeysResponse(connection: net.Socket) {
  const rdb = parseRDBfile(configPath.dir, configPath.dbfilename);
  const keysIterator = Array.from(rdb.store.keys());
  const response = setRESPArray(...keysIterator);
  setStore(rdb.store);
  connection.write(response);
}
