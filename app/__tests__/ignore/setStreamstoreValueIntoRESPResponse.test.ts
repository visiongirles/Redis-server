import { describe, expect, test } from '@jest/globals';
import { setStreamstoreValueIntoRESPResponse } from '../../setStreamstoreValueIntoRESPResponse';
import {
  KeyValuePair,
  StreamId,
  StreamValue,
} from '../../constants/streamStore';
import { setArrayInResp } from '../../setArrayInResp';

describe('Set RESP response to XREAD command', () => {
  const streamValue: StreamValue = new Map();
  const keyValuePairs: KeyValuePair[] = [
    { key: 'temperature', value: '37' },
    { key: 'humidity', value: '94' },
  ];
  const streamId: StreamId = { timestamp: '1526985054079', count: '0' };
  streamValue.set(streamId, keyValuePairs);
  const streamKey: string = 'some_key';

  const success = `*1\r\n*2\r\n$8\r\nsome_key\r\n*1\r\n*2\r\n$15\r\n1526985054079-0\r\n*4\r\n$11\r\ntemperature\r\n$2\r\n37\r\n$8\r\nhumidity\r\n$2\r\n94\r\n`;
  test(`creates RESP array`, () => {
    expect(
      setArrayInResp(
        setStreamstoreValueIntoRESPResponse(streamValue, streamKey)
      )
    ).toStrictEqual(success);
  });
});

describe('Set RESP response to XREAD command for 2 key streams', () => {
  const streamValueFirst: StreamValue = new Map();
  const keyValuePairsFirst: KeyValuePair[] = [
    { key: 'temperature', value: '95' },
  ];
  const streamIdFirst: StreamId = { timestamp: '0', count: '1' };
  streamValueFirst.set(streamIdFirst, keyValuePairsFirst);
  const streamKeyFirst: string = 'stream_key';

  const streamValueSecond: StreamValue = new Map();
  const keyValuePairsSecond: KeyValuePair[] = [
    { key: 'humidity', value: '97' },
  ];
  const streamIdSecond: StreamId = { timestamp: '0', count: '2' };
  streamValueSecond.set(streamIdSecond, keyValuePairsSecond);
  const streamKeySecond: string = 'other_stream_key';

  const fisrt = setStreamstoreValueIntoRESPResponse(
    streamValueFirst,
    streamKeyFirst
  );
  const second = setStreamstoreValueIntoRESPResponse(
    streamValueSecond,
    streamKeySecond
  );
  const array = [fisrt, second];

  const success = `*2\r\n*2\r\n$10\r\nstream_key\r\n*1\r\n*2\r\n$3\r\n0-1\r\n*2\r\n$11\r\ntemperature\r\n$2\r\n95\r\n*2\r\n$16\r\nother_stream_key\r\n*1\r\n*2\r\n$3\r\n0-2\r\n*2\r\n$8\r\nhumidity\r\n$2\r\n97\r\n`;
  test(`creates RESP array`, () => {
    expect(setArrayInResp(...array)).toStrictEqual(success);
  });
});
