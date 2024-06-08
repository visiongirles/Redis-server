import { bulkString, escapeSymbols } from './constants/constants';

// *1\r\n
// *2\r\n
// $8\r\nsome_key\r\n
// *1\r\n
//     *2\r\n
//     $15\r\n1526985054079-0\r\n
//     *4\r\n
//     $11\r\ntemperature\r\n
//     $2\r\n37\r\n
//     $8\r\nhumidity\r\n
//     $2\r\n94\r\n
//     /////
// *1\r\n
//   *1\r\n // should be 2
//   $9\r\nblueberry\r\n
//   *1\r\n
//         *1\r\n // should be 2
//             $3\r\n0-1\r\n
//             *2\r\n
//             $11\r\ntemperature\r\n
//             $2\r\n30\r\n
// *1\r\n*2\r\n$5\r\napple\r\n,*1\r\n*2\r\n$3\r\n0-1\r\n,$11\r\ntemperature\r\n$2\r\n83\r\n\r\n\r\n\r\n\r\n
export function setBulkStringinResp(...args: string[]): string {
  let response = '';
  args.forEach((arg) => {
    response += bulkString + arg.length + escapeSymbols + arg + escapeSymbols;
  });
  return response;
}
