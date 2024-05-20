import { escapeSymbols } from './constants';
import { parseBulkString } from './parseBulkString';

const indexOfSucess = 0;
const indexOfBulkString = 1;
const indexOfOffset = 2;

function isFirstArgumentArray(buffer: Buffer) {
  return buffer[0] == '*'.charCodeAt(0);
}

function isCommandHasOptions(numberOfArgumentsLeft: number) {
  return numberOfArgumentsLeft !== 0;
}

export function isArgumentBulkString(buffer: Buffer, offset: number) {
  return buffer[offset] == '$'.charCodeAt(0);
}

function parseOptions(
  argumentsCount: number,
  buffer: Buffer,
  offset: number
): [boolean, string[], number] {
  let options: string[] = [];
  while (argumentsCount !== 0) {
    const optionsParseResult = parseBulkString(buffer, offset);
    const isSuccessOptions = optionsParseResult[indexOfSucess];
    const option = optionsParseResult[indexOfBulkString];
    offset = optionsParseResult[indexOfOffset];
    if (!isSuccessOptions) {
      return [isSuccessOptions, [], 0];
    }
    argumentsCount--;
    options.push(option);
  }
  return [true, options, offset];
}

//TODO: заменить флаг isSucess  на null и
// и вернуть помимо массива с распарсенной командой, новый оффсет
// потом подумать если пришло полторы команды
export function parseBuffer(buffer: Buffer): [boolean, string[], number] {
  // local constants

  const isSuccess = true;

  let offset = 0;

  if (!isFirstArgumentArray(buffer)) return [!isSuccess, [], 0];

  const indexArgumentCountEnd = buffer.indexOf(escapeSymbols);
  if (indexArgumentCountEnd === -1) return [!isSuccess, [], 0];

  // console.log('indexArgumentCountEnd: ', indexArgumentCountEnd);

  let argumentsCount = Number(
    buffer.subarray(1, indexArgumentCountEnd).toString()
  );
  offset = indexArgumentCountEnd + escapeSymbols.length;

  // console.log('argumentsCount: ', argumentsCount);

  if (offset >= buffer.length) {
    return [!isSuccess, [], 0];
  }

  // Parse the command

  const commandParseResult = parseBulkString(buffer, offset);
  const isSuccessResult = commandParseResult[indexOfSucess];
  const command = commandParseResult[indexOfBulkString];
  offset = commandParseResult[indexOfOffset];
  argumentsCount--;
  // console.log('[commandParseResult]: ', commandParseResult);

  if (!isSuccessResult) {
    return [isSuccessResult, [], 0];
  }

  switch (command) {
    case 'PING': {
      // buffer = clearBuffer(buffer, offset);
      return [isSuccess, [command], offset];
    }

    case 'ECHO': {
      const result = parseBulkString(buffer, offset);
      const isSuccessResult = result[indexOfSucess];
      const echo = result[indexOfBulkString];
      offset = result[indexOfOffset];
      if (!isSuccessResult) {
        return [isSuccessResult, [], 0];
      }

      // buffer = clearBuffer(buffer, offset);
      return [isSuccessResult, [command, echo], offset];
    }

    case 'SET': {
      //  [ "*3", "$3", "set", "$4", "ping", "$5", "hello", "" ]
      //  "*5", "$3", "set", "$3", "foo", "$3", "bar", "$2", "px", "$3", "100", ""
      // redis-cli SET foo bar px 100

      const keyParseResult = parseBulkString(buffer, offset);
      const isSuccessKeyResult = keyParseResult[indexOfSucess];
      const key = keyParseResult[indexOfBulkString];
      offset = keyParseResult[indexOfOffset];
      argumentsCount--;
      if (!isSuccessKeyResult) {
        return [isSuccessKeyResult, [], offset];
      }

      const valueParseResult = parseBulkString(buffer, offset);
      const isSuccessValueResult = valueParseResult[indexOfSucess];
      const value = valueParseResult[indexOfBulkString];
      offset = valueParseResult[indexOfOffset];
      argumentsCount--;

      if (!isSuccessValueResult) {
        return [isSuccessValueResult, [], offset];
      }

      if (!isCommandHasOptions(argumentsCount)) {
        // buffer = clearBuffer(buffer, offset);
        return [isSuccessKeyResult, [command, key, value], offset];
      }

      // OPTIONS START

      const optionsParseResult = parseOptions(argumentsCount, buffer, offset);
      const isSuccessResult = optionsParseResult[indexOfSucess];
      const options = optionsParseResult[indexOfBulkString];
      offset = optionsParseResult[indexOfOffset];
      // console.log('Options parse result: ', isSuccessResult);
      if (!isSuccessResult) {
        return [!isSuccess, [], 0];
      }
      return [isSuccess, [command, key, value, ...options], offset];

      // let options = [];
      // while (argumentsCount !== 0) {
      //   const optionsParseResult = parseBulkString(buffer, offset);
      //   const isSuccessOptions = optionsParseResult[indexOfSucess];
      //   const option = optionsParseResult[indexOfBulkString];
      //   offset = optionsParseResult[indexOfOffset];
      //   if (!isSuccessOptions) {
      //     return [isSuccessOptions, [], offset];
      //   }
      //   argumentsCount--;
      //   options.push(option);
      // }
      return [
        isSuccessKeyResult,
        [command, key, value].concat(options),
        offset,
      ];

      // OPTIONS END
    }

    case 'GET': {
      const keyParseResult = parseBulkString(buffer, offset);
      const isSuccessKeyResult = keyParseResult[indexOfSucess];
      const key = keyParseResult[indexOfBulkString];
      offset = keyParseResult[indexOfOffset];
      argumentsCount--;
      if (!isSuccessKeyResult) {
        return [isSuccessKeyResult, [], offset];
      }
      // buffer = clearBuffer(buffer, offset);
      return [isSuccessKeyResult, [command, key], offset];
    }

    case 'INFO': {
      if (!isCommandHasOptions(argumentsCount)) {
        return [!isSuccess, [], 0];
      }

      const result = parseBulkString(buffer, offset);
      const isSuccessResult = result[indexOfSucess];
      const option = result[indexOfBulkString];
      offset = result[indexOfOffset];

      if (!isSuccessResult) {
        return [isSuccessResult, [], offset];
      }
      // buffer = clearBuffer(buffer, offset);
      return [isSuccessResult, [command, option], offset];
    }

    case 'REPLCONF': {
      if (!isCommandHasOptions(argumentsCount)) {
        // buffer = clearBuffer(buffer, offset);
        return [isSuccess, [command], offset];
      }
      // OPTIONS START

      const optionsParseResult = parseOptions(argumentsCount, buffer, offset);
      const isSuccessResult = optionsParseResult[indexOfSucess];
      const options = optionsParseResult[indexOfBulkString];
      offset = optionsParseResult[indexOfOffset];
      // console.log('Options parse result: ', isSuccessResult);
      if (!isSuccessResult) {
        return [!isSuccess, [], 0];
      }
      return [isSuccess, [command, ...options], offset];

      // const optionsParseResult = parseOptions(argumentsCount, buffer, offset);
      // const isSuccessResult = optionsParseResult[indexOfSucess];
      // const options = optionsParseResult[indexOfBulkString];
      // offset = optionsParseResult[indexOfOffset];

      // if (!isSuccessResult) {
      //   return [!isSuccess, [], 0];
      // }
      // let options: string[] = [];
      // options.push(command);
      // while (argumentsCount !== 0) {
      //   const optionsParseResult = parseBulkString(buffer, offset);
      //   const isSuccessOptions = optionsParseResult[indexOfSucess];
      //   const option = optionsParseResult[indexOfBulkString];
      //   offset = optionsParseResult[indexOfOffset];
      //   if (!isSuccessOptions) {
      //     return [isSuccessOptions, [], offset];
      //   }
      //   argumentsCount--;
      //   options.push(option);
      // }
      // buffer = clearBuffer(buffer, offset);
      // return [isSuccess, [command, ...options], offset];

      // OPTIONS END
    }

    case 'PSYNC': {
      const optionsParseResult = parseOptions(argumentsCount, buffer, offset);
      const isSuccessResult = optionsParseResult[indexOfSucess];
      const options = optionsParseResult[indexOfBulkString];
      offset = optionsParseResult[indexOfOffset];
      // console.log('Options parse result: ', isSuccessResult);
      if (!isSuccessResult) {
        return [!isSuccess, [], 0];
      }
      return [isSuccess, [command, ...options], offset];
    }
    case 'WAIT': {
      const optionsParseResult = parseOptions(argumentsCount, buffer, offset);
      const isSuccessResult = optionsParseResult[indexOfSucess];
      const options = optionsParseResult[indexOfBulkString];
      offset = optionsParseResult[indexOfOffset];
      // console.log('Options parse result: ', isSuccessResult);
      if (!isSuccessResult) {
        return [!isSuccess, [], 0];
      }
      return [isSuccess, [command, ...options], offset];
    }
    default: {
      return [!isSuccess, [], 0];
    }
  }
}
