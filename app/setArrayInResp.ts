import { escapeSymbols } from './constants/constants';

export function setArrayInResp(...args: string[]): string {
  return `*` + args.length + escapeSymbols + args.join('');
}
