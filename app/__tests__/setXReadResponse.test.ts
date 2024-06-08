import { describe, expect, test } from '@jest/globals';
import { setStreamstoreValueIntoRESPResponse } from '../setStreamstoreValueIntoRESPResponse';
import { KeyValuePair, StreamId, StreamValue } from '../constants/streamStore';

describe('Set RESP response to XREAD command', () => {
  const streamValue: StreamValue = new Map();
  const keyValuePairs: KeyValuePair[] = [
    { key: 'temperature', value: '37' },
    { key: 'humidity', value: '94' },
  ];
  const streamId: StreamId = { timestamp: '1526985054079', count: '0' };
  streamValue.set(streamId, keyValuePairs);
  const streamKey: string = 'some_key';
  // const test = [
  //   [
  //     'some_key',
  //     [['1526985054079-0', ['temperature', '37', 'humidity', '94']]],
  //   ],
  // ];

  const success = `*1\r\n*2\r\n$8\r\nsome_key\r\n*1\r\n*2\r\n$15\r\n1526985054079-0\r\n*4\r\n$11\r\ntemperature\r\n$2\r\n37\r\n$8\r\nhumidity\r\n$2\r\n94\r\n`;
  test(`creates RESP array`, () => {
    expect(
      setStreamstoreValueIntoRESPResponse(streamValue, streamKey)
    ).toStrictEqual(success);
  });
});
