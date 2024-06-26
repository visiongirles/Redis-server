import * as fs from 'fs';

const bufferForTestInBytes = Buffer.from([
  82, 69, 68, 73, 83, 48, 48, 48, 51, 250, 9, 114, 101, 100, 105, 115, 45, 118,
  101, 114, 5, 55, 46, 50, 46, 48, 250, 10, 114, 101, 100, 105, 115, 45, 98,
  105, 116, 115, 192, 64, 254, 0, 251, 4, 0, 0, 5, 109, 97, 110, 103, 111, 5,
  109, 97, 110, 103, 111, 0, 5, 97, 112, 112, 108, 101, 5, 103, 114, 97, 112,
  101, 0, 4, 112, 101, 97, 114, 6, 111, 114, 97, 110, 103, 101, 0, 10, 115, 116,
  114, 97, 119, 98, 101, 114, 114, 121, 6, 98, 97, 110, 97, 110, 97, 255, 246,
  201, 142, 181, 246, 77, 229, 177, 10,
]);

fs.writeFileSync(
  '/home/kate/coding/Codecrafters/codecrafters-redis-typescript/app/rdb.rdb',
  bufferForTestInBytes
);
