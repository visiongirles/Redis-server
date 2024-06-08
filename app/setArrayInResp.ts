import { escapeSymbols } from './constants/constants';

export function setArrayInResp(...args: string[]): string {
  return `*` + args.length + escapeSymbols + args.join('');
}

// *1\r\n
//       *2\r\n
//        $4\r\npear\r\n
//        *1\r\n
//                  *2\r\n
//                    $3\r\n
//                    0-1\r\n
//                    $11\r\ntemperature\r\n
//                    $2\r\n66\r\n
