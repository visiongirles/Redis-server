import { bulkString, escapeSymbols } from './constants/constants';

export function setBulkStringinResp(...args: string[]): string {
  let response = '';
  args.forEach((arg) => {
    response += bulkString + arg.length + escapeSymbols + arg + escapeSymbols;
  });
  return response;
}
