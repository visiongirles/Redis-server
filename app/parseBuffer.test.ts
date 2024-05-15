import { parseBuffer } from './parseBuffer';
import { describe, expect, test } from '@jest/globals';

describe('Parse ping command', () => {
  const pingCommandBuffer = Buffer.from(`*1\r\n$4\r\nPING\r\n`);
  const pingCommandBufferSuccess = [true, ['ping'], pingCommandBuffer.length];
  test(`parses ${pingCommandBuffer
    .toString()
    .replaceAll('\r\n', '\\r\\n')} to ${pingCommandBufferSuccess}`, () => {
    expect(parseBuffer(pingCommandBuffer)).toStrictEqual(
      pingCommandBufferSuccess
    );
  });
});

describe('Parse echo command', () => {
  const echoCommandBuffer = Buffer.from(`*2\r\n$4\r\nECHO\r\n$3\r\nhey\r\n`);
  const echoBufferSuccess = [true, ['echo', 'hey'], echoCommandBuffer.length];
  test(`parses ${echoCommandBuffer
    .toString()
    .replaceAll('\r\n', '\\r\\n')} to ${echoBufferSuccess}`, () => {
    expect(parseBuffer(echoCommandBuffer)).toStrictEqual(echoBufferSuccess);
  });
});

describe('Parse echo command with two arguments', () => {
  const echoCommandWithTwoArgumentsBuffer = Buffer.from(
    `*3\r\n$4\r\nECHO\r\n$12\r\nhello Twitch\r\n`
  );
  const echoCommandWithTwoArgumentsSuccess = [
    true,
    ['echo', 'hello Twitch'],
    echoCommandWithTwoArgumentsBuffer.length,
  ];
  test(`parses ${echoCommandWithTwoArgumentsBuffer
    .toString()
    .replaceAll(
      '\r\n',
      '\\r\\n'
    )} to ${echoCommandWithTwoArgumentsSuccess}`, () => {
    expect(parseBuffer(echoCommandWithTwoArgumentsBuffer)).toStrictEqual(
      echoCommandWithTwoArgumentsSuccess
    );
  });
});

describe('Parse not full command', () => {
  const notFullCommandBuffer = Buffer.from(`*3\r\n$4\r\nECH`);
  const notFullCommandBufferSuccess = [false, [], 0];
  test(`parses ${notFullCommandBuffer
    .toString()
    .replaceAll('\r\n', '\\r\\n')} to ${notFullCommandBufferSuccess}`, () => {
    expect(parseBuffer(notFullCommandBuffer)).toStrictEqual(
      notFullCommandBufferSuccess
    );
  });
});

describe('Parse set with key and value', () => {
  const setCommandBuffer = Buffer.from(
    `*3\r\n$3\r\nSET\r\n$4\r\nmilk\r\n$5\r\nwaaay\r\n`
  );
  const setCommandBufferSuccess = [
    true,
    ['set', 'milk', 'waaay'],
    setCommandBuffer.length,
  ];
  test(`parses ${setCommandBuffer
    .toString()
    .replaceAll('\r\n', '\\r\\n')} to ${setCommandBufferSuccess}`, () => {
    expect(parseBuffer(setCommandBuffer)).toStrictEqual(
      setCommandBufferSuccess
    );
  });
});

describe('Parse set with options', () => {
  const setCommandBuffer = Buffer.from(
    `*5\r\n$3\r\nSET\r\n$4\r\nmilk\r\n$5\r\nwaaay\r\n$2\r\npx\r\n$3\r\n100\r\n`
  );
  const setCommandBufferSuccess = [
    true,
    ['set', 'milk', 'waaay', 'px', '100'],
    setCommandBuffer.length,
  ];
  test(`parses ${setCommandBuffer
    .toString()
    .replaceAll('\r\n', '\\r\\n')} to ${setCommandBufferSuccess}`, () => {
    expect(parseBuffer(setCommandBuffer)).toStrictEqual(
      setCommandBufferSuccess
    );
  });
});

describe('Parse info with replication option', () => {
  const setCommandBuffer = Buffer.from(
    `*3\r\n$4\r\nINFO\r\n$11\r\nreplication\r\n`
  );
  const setCommandBufferSuccess = [
    true,
    ['info', 'replication'],
    setCommandBuffer.length,
  ];
  test(`parses ${setCommandBuffer
    .toString()
    .replaceAll('\r\n', '\\r\\n')} to ${setCommandBufferSuccess}`, () => {
    expect(parseBuffer(setCommandBuffer)).toStrictEqual(
      setCommandBufferSuccess
    );
  });
});
