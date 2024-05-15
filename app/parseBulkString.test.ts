import { describe, expect, test } from '@jest/globals';
import { parseBulkString } from './parseBulkString';

describe('Parse one argument', () => {
  const echoPingBuffer = Buffer.from(`$4\r\nPING\r\n`);
  const echoPingBufferSuccess = [true, 'PING', 10];
  test(`parses ${echoPingBuffer.toString()} to PING`, () => {
    expect(parseBulkString(echoPingBuffer, 0)).toStrictEqual(
      echoPingBufferSuccess
    );
  });
});

describe('Parse one not full argument of content with error', () => {
  const echoPingBuffer = Buffer.from(`$4\r\nPING`);
  const echoPingBufferSuccess = [false, '', 4];
  test(`parses ${echoPingBuffer.toString()} to PING`, () => {
    expect(parseBulkString(echoPingBuffer, 0)).toStrictEqual(
      echoPingBufferSuccess
    );
  });
});

describe('Parse one not full argument of size with error', () => {
  const echoPingBuffer = Buffer.from(`$4`);
  const echoPingBufferSuccess = [false, '', 1];
  test(`parses ${echoPingBuffer.toString()} to PING`, () => {
    expect(parseBulkString(echoPingBuffer, 0)).toStrictEqual(
      echoPingBufferSuccess
    );
  });
});

describe('Parse one full argument with incorrect type of data', () => {
  const echoPingBuffer = Buffer.from(`#4\r\nPING\r\n`);
  const echoPingBufferSuccess = [false, '', 0];
  test(`parses ${echoPingBuffer.toString()} to PING`, () => {
    expect(parseBulkString(echoPingBuffer, 0)).toStrictEqual(
      echoPingBufferSuccess
    );
  });
});
