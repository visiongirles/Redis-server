import * as fs from 'fs';
import * as path from 'path';
import { getString } from './getString';

export function parseRDBfile(dir: string, dbfilename: string): RDB {
  // export function parseRDBfile(contentBase64: string): RDB {
  const filePath = path.resolve(dir, dbfilename);

  //checks read permission
  fs.accessSync(filePath, fs.constants.R_OK);

  //reads file
  // const contentBase64 = fs.readFileSync(filePath, 'utf8');
  const content = fs.readFileSync(filePath);
  console.log('[parseRDBfile]: content: ', content);

  // const content = Buffer.from(contentBase64, 'base64');

  let offset = 0;
  // get title
  const redis = content.subarray(offset, 5).toString(); // TODO:
  offset = redis.length;
  console.log('[parseRDBfile]: redis: ', redis);

  //get version
  const RDBVersionNumber = Number(content.subarray(offset, offset + 4)); // TODO: сейчас в Buffer, а надо чиселку
  offset += 4;
  console.log('[parseRDBfile]: RDBVersionNumber: ', RDBVersionNumber);

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
  console.log('[parseRDBfile]: faArray: ', faArray);

  // get database selector
  if (content[offset] !== 0xfe) {
    throw Error('[parseRDBfile] error in parser, should reach FE');
  }
  offset += 1;
  const databaseID = Number(content[offset]);
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

  // get ket-value for current db selector
  let feArray = new Map();

  while (content[offset] !== 0xfe && content[offset] !== 0xff) {
    const type = content[offset];
    offset += 1;

    const keyResult = getString(content, offset);
    const key = keyResult.value;
    offset = keyResult.offset;
    let value;
    switch (type) {
      // TODO: все случаи разобрать
      case 0: {
        const valueResult = getString(content, offset);
        value = valueResult.value;
        offset = valueResult.offset;
        break;
      }
      default:
        throw Error(`Key-value parsing, TYPE ${type} not implement`);
    }

    feArray.set(key, value);
  }
  // TODO: selector db сделать чтобы остальные бд тоже парсилась
  const rdb = new RDB(
    redis,
    RDBVersionNumber,
    faArray,
    databaseID,
    [fb.sizeHashTable, fb.sizeExpireHashTable],
    feArray
  );
  return rdb;
}
export class RDB {
  title: string;
  RDBversionNumber: number;
  fa: Map<string, string>;
  databaseID: number;
  fb: number[];
  hashmap: Map<string, any>;
  constructor(
    title: string,
    RDBversionNumber: number,
    fa: Map<string, string>,
    databaseID: number,
    fb: number[],
    hashmap: Map<string, any>
  ) {
    this.title = title;
    this.RDBversionNumber = RDBversionNumber;
    this.fa = fa; // TODO: ?! копировать через .map метод
    this.databaseID = databaseID;
    this.fb = fb;
    this.hashmap = hashmap;
  }
}

interface StringSizeResult {
  stringSize: number;
  size: number;
}

export function getStringSize(
  content: Buffer,
  offset: number
): StringSizeResult {
  let stringLength = 0;
  const currentByte = content[offset];

  switch (currentByte >> 6) {
    case 0: {
      stringLength = currentByte;

      return { stringSize: stringLength, size: 1 };
    }
    case 1: {
      // 0100000001010101 потеряем если будет больше 53х бит а у нас пока 14
      // TODO: little Endian? или не надо, т.к. два бита зануляются
      const nextByte = content[offset + 1];
      stringLength = (nextByte << 8) | (currentByte & 0b00111111);
      // stringLength = ((currentByte & 0b00111111) << 8) | nextByte;
      return { stringSize: stringLength, size: 2 };
    }
    case 2: {
      stringLength =
        (content[offset + 4] << (8 * 3)) |
        (content[offset + 3] << (8 * 2)) |
        (content[offset + 2] << 8) |
        content[offset + 1];
      return { stringSize: stringLength, size: 5 };
    }
    case 3: {
      return { stringSize: -1, size: 2 };
      // throw Error('[case 0x11]: has not been implemented yet');
    }

    default:
      throw Error('[default]: got default case - nothing happend, wrong byte?');
  }
}
