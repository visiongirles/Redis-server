import { escapeSymbols } from './constants/constants';
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

  if (!isSuccessResult) {
    return [isSuccessResult, [], 0];
  }

  switch (command) {
    case 'PING':
    case 'ECHO':
    case 'SET':
    case 'GET':
    case 'PSYNC':
    case 'CONFIG':
    case 'INFO':
    case 'WAIT':
    case 'REPLCONF':
    case 'KEYS': {
      if (!isCommandHasOptions(argumentsCount)) {
        console.log('Options parse result: ', isSuccess, command);

        return [isSuccess, [command], offset];
      }

      const optionsParseResult = parseOptions(argumentsCount, buffer, offset);
      const isSuccessResult = optionsParseResult[indexOfSucess];
      const options = optionsParseResult[indexOfBulkString];
      offset = optionsParseResult[indexOfOffset];
      console.log('Options parse result: ', isSuccessResult);
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
