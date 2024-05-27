import { bulkString, escapeSymbols } from './constants/constants';

export function setRESPArray(...args: string[]): string {
  let response = `*` + args.length + escapeSymbols;
  args.forEach((arg) => {
    response += bulkString + arg.length + escapeSymbols + arg + escapeSymbols;
  });
  return response;
}
