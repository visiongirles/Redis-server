import { escapeSymbols } from './constants/constants';
import { isArgumentBulkString } from './isArgumentBulkString';

type ReturnResult = [boolean, string, number];

// *1/r/n/ [0-3] $4 [4-5] r/n/ [6-7] PING [8-11] + \r\n [12-13]
export function parseBulkString(buffer: Buffer, offset: number): ReturnResult {
  const isSuccess = true;

  if (!isArgumentBulkString(buffer, offset)) {
    // console.log(
    //   '[Error]: excpected to receive $, but got: ',
    //   buffer[offset].toString()
    // );
    return [!isSuccess, '', offset];
  }

  offset++;

  const indexBulkStringSizeEnd = buffer.indexOf(escapeSymbols, offset);

  if (indexBulkStringSizeEnd === -1) {
    console.log("[Error]: haven't found \\r\\n");

    return [!isSuccess, '', offset];
  }

  const bulkStringSize = Number(
    buffer.subarray(offset, indexBulkStringSizeEnd).toString()
  );

  offset = indexBulkStringSizeEnd + escapeSymbols.length;

  if (offset + bulkStringSize + escapeSymbols.length > buffer.length) {
    console.log('[Error]: not enough data in buffer');
    console.log(
      'EXPECTED buffer size: ',
      offset + bulkStringSize + escapeSymbols.length
    );
    console.log('REAL buffer size: ', buffer.length);

    return [!isSuccess, '', offset];
  }

  const indexBulkStringEnd = offset + bulkStringSize;

  const bulkString = buffer.subarray(offset, indexBulkStringEnd).toString();

  offset = indexBulkStringEnd + escapeSymbols.length;

  return [isSuccess, bulkString, offset];
}
