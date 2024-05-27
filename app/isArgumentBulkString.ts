export function isArgumentBulkString(buffer: Buffer, offset: number) {
  return buffer[offset] == '$'.charCodeAt(0);
}
