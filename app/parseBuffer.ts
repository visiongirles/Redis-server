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
    console.log(
      '[parseBuffer] isFirstArgumentArray is NOT array: isSuccess = false'
    );
    return parsedBufferFailure;
  }

  const indexArgumentCountEnd = buffer.indexOf(escapeSymbols);
  if (indexArgumentCountEnd === -1) {
    console.log('[parseBuffer] indexArgumentCountEnd is -1: isSuccess = false');

    return parsedBufferFailure;
  }

  // console.log('indexArgumentCountEnd: ', indexArgumentCountEnd);

  let argumentsCount = Number(
    buffer.subarray(1, indexArgumentCountEnd).toString()
  );
  offset = indexArgumentCountEnd + escapeSymbols.length;

  // console.log('argumentsCount: ', argumentsCount);

  if (offset >= buffer.length) {
    console.log('[parseBuffer] offset >= buffer.length: isSuccess = false');

    return parsedBufferFailure;
  }

  // Parse the command

  const commandParseResult = parseBulkString(buffer, offset);
  const isSuccessResult = commandParseResult[indexOfSucess];
  const command = commandParseResult[indexOfBulkString].toUpperCase();
  console.log('[parseBuffer] command', command);
  offset = commandParseResult[indexOfOffset];
  argumentsCount--;

  if (!isSuccessResult) {
    console.log('[commandParseResult] cannot find command: isSuccess = false');

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
    case 'XRANGE': {
      if (!isCommandHasOptions(argumentsCount)) {
        console.log('Options parse result: ', isSuccess, command);
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
      // console.log('Options parse result: ', isSuccessResult);
      if (!isSuccessResult) {
        console.log('Options parse result: ', isSuccess, command);

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
