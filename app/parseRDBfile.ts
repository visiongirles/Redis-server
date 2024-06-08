import * as fs from 'fs';
import * as path from 'path';
import { getString } from './getString';
import { getStringSize } from './getStringSize';
import { StoreValue, StoreValueType } from './constants/store';

export function parseRDBfile(dir: string, dbfilename: string): RDB {
  // export function parseRDBfile(contentBase64: string): RDB {
  const filePath = path.resolve(dir, dbfilename);

  if (!fs.existsSync(filePath))
    return new RDB(
      '',
      -1,
      new Map<string, string>(),
      -1,
      [],
      new Map<string, any>()
    );
  //checks read permission
  fs.accessSync(filePath, fs.constants.R_OK);

  //reads file
  // const contentBase64 = fs.readFileSync(filePath, 'utf8');
  const content = fs.readFileSync(filePath);
  // console.log('[parseRDBfile]: content: ', content);

  // const content = Buffer.from(contentBase64, 'base64');

  let offset = 0;
  // get title
  const redis = content.subarray(offset, 5).toString();
  offset = redis.length;
  // console.log('[parseRDBfile]: redis: ', redis);

  //get version
  const RDBVersionNumber = Number(content.subarray(offset, offset + 4));
  offset += 4;
  // console.log('[parseRDBfile]: RDBVersionNumber: ', RDBVersionNumber);

  //get Auxiliary fields
  const faArray = new Map(); // TODO:

  while (content[offset] == 0xfa) {
    offset += 1;
    const keyResult = getString(content, offset);
    const key = keyResult.value;
    offset = keyResult.offset;

    const valueResult = getStringSize(content, offset);
    const valueSize = valueResult.stringSize;
    let value;

    if (valueSize === -1 && key === 'redis-bits') {
      // Bit architecture of the system that wrote the RDB, either 32 or 64
      offset += 1;
      value = content[offset];
      offset += 1;
    } else {
      offset += valueResult.size;
      value = content.subarray(offset, offset + valueSize).toString();
      offset += valueSize;
    }
    faArray.set(key, value);
  }
  // console.log('[parseRDBfile]: faArray: ', faArray);

  // get database selector
  if (content[offset] !== 0xfe) {
    throw Error('[parseRDBfile] error in parser, should reach FE');
  }
  offset += 1;
  const databaseID = Number(content[offset]);
  // console.log('[parseRDBfile]: databaseID: ', databaseID);

  offset += 1;

  // get resizedb field
  const fb = { sizeHashTable: -1, sizeExpireHashTable: -1 };
  if (content[offset] === 0xfb) {
    offset += 1;
    fb.sizeHashTable = Number(content[offset]);
    offset += 1;
    fb.sizeExpireHashTable = Number(content[offset]);
    offset += 1;
  }
  // console.log('[parseRDBfile]: fb: ', fb);

  // get ket-value for current db selector
  let store: Map<string, StoreValue> = new Map();

  while (content[offset] !== 0xfe && content[offset] !== 0xff) {
    let expiry = null;
    switch (content[offset]) {
      case 0xfc: {
        offset += 1;
        expiry = Number(content.readBigUInt64LE(offset));
        console.log('0xfc offset + 8', expiry);
        offset += 8;
        break;
      }
      case 0xfd: {
        offset += 1;
        expiry = Number(content.readUInt32LE(offset)) * 1000;
        console.log('0xfd offset + 4', expiry);
        offset += 4;
        break;
      }
    }

    const type = content[offset];
    offset += 1;

    const keyResult = getString(content, offset);
    const key = keyResult.value;
    offset = keyResult.offset;
    let value;
    switch (type) {
      case 0: {
        const valueResult = getString(content, offset);
        value = valueResult.value;
        offset = valueResult.offset;
        break;
      }
      default:
        throw Error(`Key-value parsing, TYPE ${type} not implement`);
    }

    store.set(key, {
      value: value,
      timeToLive: expiry,
      type: StoreValueType.String,
    });
  }
  // console.log('[parseRDBfile]: store: ', store);

  // TODO: selector db сделать чтобы остальные бд тоже парсилась
  const rdb = new RDB(
    redis,
    RDBVersionNumber,
    faArray,
    databaseID,
    [fb.sizeHashTable, fb.sizeExpireHashTable],
    store
  );
  return rdb;
}
export class RDB {
  title: string;
  RDBversionNumber: number;
  fa: Map<string, string>;
  databaseID: number;
  fb: number[];
  store: Map<string, any>;

  constructor(
    title: string,
    RDBversionNumber: number,
    fa: Map<string, string>,
    databaseID: number,
    fb: number[],
    store: Map<string, any>
  ) {
    this.title = title;
    this.RDBversionNumber = RDBversionNumber;
    this.fa = fa; // TODO: ?! копировать через .map метод
    this.databaseID = databaseID;
    this.fb = fb;
    this.store = store;
  }
}
