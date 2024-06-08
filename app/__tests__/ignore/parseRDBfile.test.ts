import { RDB, parseRDBfile } from '../../parseRDBfile';
import { describe, expect, test } from '@jest/globals';

describe('Parse RDB file', () => {
  // const content = `UkVESVMwMDAz+glyZWRpcy12ZXIFNy4yLjD6CnJlZGlzLWJpdHPAQP4A+wEAAAVhcHBsZQlyYXNwYmVycnn/Hhm5WA645E0K`;
  const dir =
    '/home/kate/coding/Codecrafters/codecrafters-redis-typescript/app';
  const filenamedb = 'rdb.rdb';
  const fa = new Map<string, any>([
    ['redis-ver', '7.2.0'],
    ['redis-bits', 64],
  ]);
  const store = new Map<string, any>([
    ['mango', { value: 'mango', timeToLive: null, type: 0 }],
    ['apple', { value: 'grape', timeToLive: null, type: 0 }],
    ['pear', { value: 'orange', timeToLive: null, type: 0 }],
    ['strawberry', { value: 'banana', timeToLive: null, type: 0 }],
  ]);
  const success = new RDB('REDIS', 3, fa, 0, [4, 0], store);

  test(`Parse RDB file`, () => {
    // expect(parseRDBfile(content)).toStrictEqual(success);
    expect(parseRDBfile(dir, filenamedb)).toStrictEqual(success);
  });
});
