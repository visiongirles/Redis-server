import { parseBuffer } from '../parseBuffer';
import { describe, expect, test } from '@jest/globals';

describe('Parse ping command', () => {
  const pingCommandBuffer = Buffer.from(`*1\r\n$4\r\nPING\r\n`);
  // const pingCommandBufferSuccess = [true, ['PING'], pingCommandBuffer.length];
  const pingCommandBufferSuccess = {
    isSuccess: true,
    command: 'PING',
    offset: pingCommandBuffer.length,
    options: [],
  };
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
  const echoBufferSuccess = {
    isSuccess: true,
    command: 'ECHO',
    offset: echoCommandBuffer.length,
    options: ['hey'],
  };
  test(`parses ${echoCommandBuffer
    .toString()
    .replaceAll('\r\n', '\\r\\n')} to ${echoBufferSuccess}`, () => {
    expect(parseBuffer(echoCommandBuffer)).toStrictEqual(echoBufferSuccess);
  });
});

describe('Parse echo command with two arguments', () => {
  const echoCommandWithTwoArgumentsBuffer = Buffer.from(
    `*2\r\n$4\r\nECHO\r\n$12\r\nhello Twitch\r\n`
  );

  const echoCommandWithTwoArgumentsSuccess = {
    isSuccess: true,
    command: 'ECHO',
    offset: echoCommandWithTwoArgumentsBuffer.length,
    options: ['hello Twitch'],
  };
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

  const notFullCommandBufferSuccess = {
    isSuccess: false,
    command: '',
    options: [],
    offset: 0,
  };
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

  const setCommandBufferSuccess = {
    isSuccess: true,
    command: 'SET',
    offset: setCommandBuffer.length,
    options: ['milk', 'waaay'],
  };
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

  const setCommandBufferSuccess = {
    isSuccess: true,
    command: 'SET',
    offset: setCommandBuffer.length,
    options: ['milk', 'waaay', 'px', '100'],
  };
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
    `*2\r\n$4\r\nINFO\r\n$11\r\nreplication\r\n`
  );

  const setCommandBufferSuccess = {
    isSuccess: true,
    command: 'INFO',
    offset: setCommandBuffer.length,
    options: ['replication'],
  };

  test(`parses ${setCommandBuffer
    .toString()
    .replaceAll('\r\n', '\\r\\n')} to ${setCommandBufferSuccess}`, () => {
    expect(parseBuffer(setCommandBuffer)).toStrictEqual(
      setCommandBufferSuccess
    );
  });
});

describe('Parse replconf with listening-port', () => {
  const setCommandBuffer = Buffer.from(
    `*3\r\n$8\r\nREPLCONF\r\n$14\r\nlistening-port\r\n$4\r\n6380\r\n`
  );

  const setCommandBufferSuccess = {
    isSuccess: true,
    command: 'REPLCONF',
    offset: setCommandBuffer.length,
    options: ['listening-port', '6380'],
  };
  test(`parses ${setCommandBuffer
    .toString()
    .replaceAll('\r\n', '\\r\\n')} to ${setCommandBufferSuccess}`, () => {
    expect(parseBuffer(setCommandBuffer)).toStrictEqual(
      setCommandBufferSuccess
    );
  });
});

describe('Parse replconf with capabilities', () => {
  const setCommandBuffer = Buffer.from(
    `*3\r\n$8\r\nREPLCONF\r\n$4\r\ncapa\r\n$6\r\npsync2\r\n`
  );

  const setCommandBufferSuccess = {
    isSuccess: true,
    command: 'REPLCONF',
    offset: setCommandBuffer.length,
    options: ['capa', 'psync2'],
  };
  test(`parses ${setCommandBuffer
    .toString()
    .replaceAll('\r\n', '\\r\\n')} to ${setCommandBufferSuccess}`, () => {
    expect(parseBuffer(setCommandBuffer)).toStrictEqual(
      setCommandBufferSuccess
    );
  });
});

describe('Parse psync with options', () => {
  const setCommandBuffer = Buffer.from(
    `*3\r\n$5\r\nPSYNC\r\n$1\r\n?\r\n$2\r\n-1\r\n`
  );

  const setCommandBufferSuccess = {
    isSuccess: true,
    command: 'PSYNC',
    offset: setCommandBuffer.length,
    options: ['?', '-1'],
  };
  test(`parses ${setCommandBuffer
    .toString()
    .replaceAll('\r\n', '\\r\\n')} to ${setCommandBufferSuccess}`, () => {
    expect(parseBuffer(setCommandBuffer)).toStrictEqual(
      setCommandBufferSuccess
    );
  });
});
