import { createRDBfileResponse } from './createRDBfileResponse';
import { describe, expect, test } from '@jest/globals';

describe('Parse psync with options', () => {
  const setCommandBuffer = Buffer.from(
    `*3\r\n$5\r\nPSYNC\r\n$1\r\n?\r\n$2\r\n-1\r\n`
  );
  const setCommandBufferSuccess = [
    true,
    ['psync', '?', '-1'],
    setCommandBuffer.length,
  ];
  test(`parses ${setCommandBuffer
    .toString()
    .replaceAll('\r\n', '\\r\\n')} to ${setCommandBufferSuccess}`, () => {
    expect(createRDBfileResponse()).toStrictEqual(setCommandBufferSuccess);
  });
});
