import { escapeSymbols } from './constants/constants';
import { parseBulkString } from './parseBulkString';

const indexOfSucess = 0;
const indexOfBulkString = 1;
const indexOfOffset = 2;

interface ParsedBuffer {
  isSuccess: boolean;
  command: string;
  options: string[];
  offset: number;
}

function isFirstArgumentArray(buffer: Buffer) {
  return buffer[0] == '*'.charCodeAt(0);
}

function isCommandHasOptions(numberOfArgumentsLeft: number) {
  return numberOfArgumentsLeft !== 0;
}

interface parsedOptions {
  isSucess: boolean;
  options: string[];
  offset: number;
}

const parsedOptionsFailure: parsedOptions = {
  isSucess: false,
  options: [],
  offset: 0,
};

function parseOptions(
  argumentsCount: number,
  buffer: Buffer,
  offset: number
): parsedOptions {
  let options: string[] = [];
  while (argumentsCount !== 0) {
    const optionsParseResult = parseBulkString(buffer, offset);
    const isSuccessOptions = optionsParseResult[indexOfSucess];
    const option = optionsParseResult[indexOfBulkString];
    offset = optionsParseResult[indexOfOffset];
    if (!isSuccessOptions) {
      return parsedOptionsFailure;
    }
    argumentsCount--;
    options.push(option);
  }
  return { isSucess: true, options, offset };
}

const parsedBufferFailure = {
  isSuccess: false,
  command: '',
  options: [],
  offset: 0,
};

export function parseBuffer(buffer: Buffer): ParsedBuffer {
  // local constants

  const isSuccess = true;

  let offset = 0;

  if (!isFirstArgumentArray(buffer)) {
    return parsedBufferFailure;
  }

  const indexArgumentCountEnd = buffer.indexOf(escapeSymbols);
  if (indexArgumentCountEnd === -1) {
    return parsedBufferFailure;
  }

  let argumentsCount = Number(
    buffer.subarray(1, indexArgumentCountEnd).toString()
  );
  offset = indexArgumentCountEnd + escapeSymbols.length;

  if (offset >= buffer.length) {
    return parsedBufferFailure;
  }

  // Parse the command
  const commandParseResult = parseBulkString(buffer, offset);
  const isSuccessResult = commandParseResult[indexOfSucess];
  const command = commandParseResult[indexOfBulkString].toUpperCase();
  offset = commandParseResult[indexOfOffset];
  argumentsCount--;

  if (!isSuccessResult) {
    return parsedBufferFailure;
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
    case 'KEYS':
    case 'TYPE':
    case 'XADD':
    case 'XRANGE':
    case 'XREAD': {
      if (!isCommandHasOptions(argumentsCount)) {
        return {
          isSuccess,
          command,
          options: [],
          offset,
        };
      }

      const optionsParseResult = parseOptions(argumentsCount, buffer, offset);
      const isSuccessResult = optionsParseResult.isSucess;
      const options = optionsParseResult.options;
      offset = optionsParseResult.offset;
      if (!isSuccessResult) {
        return parsedBufferFailure;
      }
      return {
        isSuccess,
        command,
        options,
        offset,
      };
    }

    default: {
      console.log(
        '[parseBuffer]: DEFAULT command, ' +
          command +
          ' has not implemented yet'
      );
      return parsedBufferFailure;
    }
  }
}
