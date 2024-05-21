import { bulkString, escapeSymbols } from './constants';

export function createRESPArray(...args: string[]): string {
  let response = `*` + args.length + escapeSymbols;
  args.forEach((arg) => {
    response += bulkString + arg.length + escapeSymbols + arg + escapeSymbols;
  });
  return response;
}
