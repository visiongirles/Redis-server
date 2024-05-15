import { escapeSymbols } from './constants';
import { parseBulkString } from './parseBulkString';

function isFirstArgumentArray(buffer: Buffer) {
  return buffer[0] == '*'.charCodeAt(0);
}

function isCommandHasOptions(numberOfArgumentsLeft: number) {
  return numberOfArgumentsLeft !== 0;
}

export function isArgumentBulkString(buffer: Buffer, offset: number) {
  return buffer[offset] == '$'.charCodeAt(0);
}

//TODO: заменить флаг isSucess  на null и
// и вернуть помимо массива с распарсенной командой, новый оффсет
// потом подумать если пришло полторы команды
export function parseBuffer(buffer: Buffer): [boolean, string[]] {
  // local constants
  const indexOfSucess = 0;
  const indexOfBulkString = 1;
  const indexOfOffset = 2;
  const isSuccess = true;

  let offset = 0;

  if (!isFirstArgumentArray(buffer)) return [!isSuccess, []];

  const indexArgumentCountEnd = buffer.indexOf(escapeSymbols);
  if (indexArgumentCountEnd === -1) return [!isSuccess, []];

  // console.log('indexArgumentCountEnd: ', indexArgumentCountEnd);

  let argumentsCount = Number(
    buffer.subarray(1, indexArgumentCountEnd).toString()
  );
  offset = indexArgumentCountEnd + escapeSymbols.length;

  // console.log('argumentsCount: ', argumentsCount);

  if (offset >= buffer.length) {
    return [!isSuccess, []];
  }

  // Parse the command

  const commandParseResult = parseBulkString(buffer, offset);
  const isSuccessResult = commandParseResult[indexOfSucess];
  const command = commandParseResult[indexOfBulkString]
    .toString()
    .toLowerCase();
  offset = commandParseResult[indexOfOffset];
  argumentsCount--;
  console.log('[commandParseResult]: ', commandParseResult);

  if (!isSuccessResult) {
    return [isSuccessResult, []];
  }

  switch (command) {
    case 'ping': {
      return [isSuccess, [command]];
    }

    case 'echo': {
      const result = parseBulkString(buffer, offset);
      const isSuccessResult = result[indexOfSucess];
      const echo = result[indexOfBulkString];

      if (!isSuccessResult) {
        return [isSuccessResult, []];
      }

      return [isSuccessResult, [command, echo]];

      // *2\r\n$4\r\nECHO\r\n$3\r\nhey\r\n
      // if (!isArgumentBulkString(buffer, offset)) return [!isSuccess, []];
      // offset++;
      // const indexEchoSizeEnd = buffer.indexOf(escapeSymbols, offset);
      // if (indexEchoSizeEnd === -1) return [!isSuccess, []];

      // const echoSize = Number(
      //   buffer.subarray(offset, indexEchoSizeEnd).toString()
      // );

      // offset = indexEchoSizeEnd + escapeSymbols.length;
      // console.log('echoSize: ', echoSize);

      // if (offset + echoSize + escapeSymbols.length > buffer.length) {
      //   return [!isSuccess, []];
      // }
      // const indexOfEchoEnd = offset + echoSize;
      // // const indexOfEchoEnd = buffer.indexOf(escapeSymbols, offset);
      // // if (indexOfEchoEnd === -1) return [isFailed, []];
      // console.log('indexOfEchoEnd: ', indexOfEchoEnd);

      // const echo = buffer.subarray(offset, indexOfEchoEnd).toString();

      // return [isSuccess, [echo]];
    }

    case 'set': {
      //  [ "*3", "$3", "set", "$4", "ping", "$5", "hello", "" ]
      //  "*5", "$3", "set", "$3", "foo", "$3", "bar", "$2", "px", "$3", "100", ""
      // redis-cli SET foo bar px 100
      // redis-cli SET foo bar px 100

      const keyParseResult = parseBulkString(buffer, offset);
      const isSuccessKeyResult = keyParseResult[indexOfSucess];
      const key = keyParseResult[indexOfBulkString].toString();
      offset = keyParseResult[indexOfOffset];
      argumentsCount--;
      if (!isSuccessKeyResult) {
        return [isSuccessKeyResult, []];
      }

      const valueParseResult = parseBulkString(buffer, offset);
      const isSuccessValueResult = valueParseResult[indexOfSucess];
      const value = valueParseResult[indexOfBulkString].toString();
      offset = valueParseResult[indexOfOffset];
      argumentsCount--;

      if (!isSuccessValueResult) {
        return [isSuccessValueResult, []];
      }
      if (!isCommandHasOptions(argumentsCount)) {
        return [isSuccessKeyResult, [command, key, value]];
      }

      // OPTIONS START
      let options = [];
      while (argumentsCount !== 0) {
        const optionsParseResult = parseBulkString(buffer, offset);
        const isSuccessOptions = optionsParseResult[indexOfSucess];
        const option = optionsParseResult[indexOfBulkString];
        offset = optionsParseResult[indexOfOffset];
        if (!isSuccessOptions) {
          return [isSuccessOptions, []];
        }
        argumentsCount--;
        options.push(option);
      }

      return [isSuccessKeyResult, [command, key, value].concat(options)];

      // OPTIONS END

      // if (!isArgumentBulkString(buffer, offset)) return [!isSuccess, []];
      // offset++;

      // const indexKeySizeEnd = buffer.indexOf(escapeSymbols, offset);
      // if (indexKeySizeEnd === -1) return [!isSuccess, []];

      // console.log('indexKeySizeEnd: ', indexKeySizeEnd);

      // const keySize = Number(
      //   buffer.subarray(offset, indexKeySizeEnd).toString()
      // );

      // offset = keySize + escapeSymbols.length;
      // console.log('keySize: ', keySize);

      // if (offset + keySize + escapeSymbols.length > buffer.length) {
      //   return [!isSuccess, []];
      // }

      // // const key = '';

      // return [isSuccess, []];
    }

    case 'info': {
      if (!isCommandHasOptions(argumentsCount)) {
        return [!isSuccess, []];
      }

      const result = parseBulkString(buffer, offset);
      const isSuccessResult = result[indexOfSucess];
      const option = result[indexOfBulkString];

      if (!isSuccessResult) {
        return [isSuccessResult, []];
      }

      return [isSuccessResult, [command, option]];
    }

    default: {
      return [!isSuccess, []];
    }
  }
}
