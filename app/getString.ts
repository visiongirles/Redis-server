import { getStringSize } from './getStringSize';

export function getString(content: Buffer, offset: number) {
  const keyResult = getStringSize(content, offset);
  const keySize = keyResult.stringSize;
  offset += keyResult.size;
  const key = content.subarray(offset, offset + keySize).toString();
  offset += keySize;
  return { value: key, offset: offset };
}
