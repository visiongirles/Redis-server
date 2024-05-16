import { bulkString, escapeSymbols } from './constants';

export function createRDBfileResponse(): Buffer {
  const contentBase64 = `UkVESVMwMDEx+glyZWRpcy12ZXIFNy4yLjD6CnJlZGlzLWJpdHPAQPoFY3RpbWXCbQi8ZfoIdXNlZC1tZW3CsMQQAPoIYW9mLWJhc2XAAP/wbjv+wP9aog==`;

  const content = Buffer.from(contentBase64, 'base64');
  const start = Buffer.from(bulkString + content.length + escapeSymbols);
  const response = Buffer.concat([start, content]);

  return response;
}