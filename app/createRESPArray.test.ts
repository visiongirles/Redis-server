import { describe, expect, test } from '@jest/globals';
import { createRESPArray } from './createRESPArray';

describe('Create RESP Array from 2 strings', () => {
  const sucess = `*2\r\n$5\r\nhello\r\n$3\r\ncat\r\n`;
  test(`creates hello cat in RESP`, () => {
    expect(createRESPArray('hello', 'cat')).toStrictEqual(sucess);
  });
});

describe('Create RESP Array from 3 strings', () => {
  const sucess = `*3\r\n$5\r\nhello\r\n$6\r\nginger\r\n$3\r\ncat\r\n`;
  test(`creates hello cat in RESP`, () => {
    expect(createRESPArray('hello', 'ginger', 'cat')).toStrictEqual(sucess);
  });
});
