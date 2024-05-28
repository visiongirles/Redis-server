import { RDB, parseRDBfile } from '../parseRDBfile';
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
  const hashmap = new Map<string, any>([['apple', 'raspberry']]);
  const success: RDB = {
    RDBversionNumber: 3,
    databaseID: 0,
    fa: fa,
    fb: [1, 0],
    hashmap: hashmap,
    title: 'REDIS',
  };
  test(`Parse RDB file`, () => {
    // expect(parseRDBfile(content)).toStrictEqual(success);
    expect(parseRDBfile(dir, filenamedb)).toStrictEqual(success);
  });
});

describe('Parse RDB file with apple and raspberry', () => {
  // const content = `UkVESVMwMDAz+glyZWRpcy12ZXIFNy4yLjD6CnJlZGlzLWJpdHPAQP4A+wEAAAVhcHBsZQlyYXNwYmVycnn/Hhm5WA645E0K`;
  const dir =
    '/home/kate/coding/Codecrafters/codecrafters-redis-typescript/app';
  const filenamedb = 'rdb.rdb';
  const fa = new Map<string, any>([
    ['redis-ver', '7.2.0'],
    ['redis-bits', 64],
  ]);
  const hashmap = new Map<string, any>([['apple', 'raspberry']]);
  const success: RDB = {
    RDBversionNumber: 3,
    databaseID: 0,
    fa: fa,
    fb: [1, 0],
    hashmap: hashmap,
    title: 'REDIS',
  };
  test(`Parse RDB file`, () => {
    // expect(parseRDBfile(content)).toStrictEqual(success);
    expect(parseRDBfile(dir, filenamedb)).toStrictEqual(success);
  });
});
