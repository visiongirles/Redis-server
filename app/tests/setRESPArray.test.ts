import { describe, expect, test } from '@jest/globals';
import { setRESPArray } from '../setRESPArray';

describe('Set RESP Array from 2 strings', () => {
  const sucess = `*2\r\n$5\r\nhello\r\n$3\r\ncat\r\n`;
  test(`creates hello cat in RESP`, () => {
    expect(setRESPArray('hello', 'cat')).toStrictEqual(sucess);
  });
});

describe('Set RESP Array from 3 strings', () => {
  const sucess = `*3\r\n$5\r\nhello\r\n$6\r\nginger\r\n$3\r\ncat\r\n`;
  test(`creates hello cat in RESP`, () => {
    expect(setRESPArray('hello', 'ginger', 'cat')).toStrictEqual(sucess);
  });
});
