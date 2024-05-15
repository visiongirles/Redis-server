export function clearBuffer(buffer: Buffer, offset: number) {
  return buffer.subarray(offset);
}
