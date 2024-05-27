import { clearBuffer } from './functions/clearBuffer';

export function getRDBfile(clientBuffer: Buffer): Buffer {
  if (clientBuffer[0] === '$'.charCodeAt(0)) {
    const indexOfSize = clientBuffer.indexOf('\r\n');
    const size = Number(clientBuffer.subarray(1, indexOfSize).toString());
    return clearBuffer(clientBuffer, indexOfSize + size + 2);
  }
  return clientBuffer;
}
