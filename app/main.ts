import * as net from 'net';
import { store } from './store';
import { serverInfo } from './config';
import {
  bulkString,
  escapeSymbols,
  simpleString,
  nullBulkString,
} from './constants';
// import { requestParser } from './requestParser';
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log('Logs from your program will appear here!');

const indexOfPortFlag = process.argv.indexOf('--port');

// TODO: добавить обработку случая, когдау  нас выход за массивю. т.е. после флага порта, не передал реально порт -
// в текуще случае будет NAN
// 1) если нет флага, то у нас индекс -1 и порт 6379
// 2) если мы вышли за границы массива, т.е. есть флаг ,но нет аргумента после него, то 6379

// let port = (indexOfPortFlag !== -1) ? Number(process.argv[indexOfPortFlag + 1]) : 6379

let port = 6379;

if (indexOfPortFlag !== -1 && process.argv[indexOfPortFlag + 1]) {
  port = Number(process.argv[indexOfPortFlag + 1]);
}

console.log('[process.argv]: ', process.argv);
console.log('[port]: ', port);

// Uncomment this block to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
  // Handle connection

  connection.on('end', function () {
    console.log('client disconnected');
  });

  //   connection.write('+PONG\r\n');
  //   connection.pipe(connection);

  connection.on('data', (data: string | Buffer) => {
    // console.log('[Server]: ', server);

    let index = 0;

    // parse the request
    // split the arguments by escaping symbols
    const request = data.toString().toLowerCase().split(escapeSymbols);
    console.log('request: ', request);

    // check the first part of the request if there are enough arguments
    if (request[0].length < 2)
      throw Error("Request isn't correct. No enough arguments in type of data");

    const typeOfData: string = request[index][0]; // e.g. * which means array
    console.log('typeOfData: ', typeOfData);

    // const numberOfArguments: number = Number(request[0][1]);
    const numberOfArguments = Number(request[index].slice(1));
    console.log('numberOfArguments: ', numberOfArguments);

    // shift to the next array element
    index++;

    for (index; index <= numberOfArguments * 2; index++) {
      // check the following part of the request if there are enough arguments
      // e.g. $4/r/n where $-Bulk strings - length === 2 [1]
      if (request[index].length < 2) {
        throw Error(
          `Request isn't correct. No enough arguments in line # ${index}`
        );
      }

      const sizeOfData = Number(request[index].slice(1));

      // shift to the next array element
      index++;

      if (request[index].length < sizeOfData) {
        throw Error(
          `Request isn't correct. Not enough data in line # ${index}`
        );
      }

      // extract command from the request
      const command = request[index];

      switch (command) {
        case 'ping': {
          connection.write(simpleString + 'PONG' + escapeSymbols);

          break;
        }
        case 'echo': {
          index++;
          if (request[index].length < 2) {
            throw Error(
              `Request isn't correct. No enough arguments in line # ${index}`
            );
          }

          const sizeOfData = Number(request[index].slice(1));

          // shift to the next array element
          index++;

          if (request[index].length < sizeOfData) {
            throw Error(
              `Request isn't correct. Not enough data in line # ${index}`
            );
          }

          const data =
            bulkString +
            request[index].length +
            escapeSymbols +
            request[index] +
            escapeSymbols;
          // const data = '+' + request[index] + escapeSymbols;
          console.log('data: ', data);
          connection.write(data);
          break;
        }
        case 'set': {
          // shift to the next array element
          index++;

          // retrieve the 'key'
          if (request[index].length < 2) {
            throw Error(
              `Request isn't correct. No enough arguments in line # ${index}`
            );
          }

          let sizeOfData = Number(request[index].slice(1));

          // shift to the next array element
          index++;

          if (request[index].length < sizeOfData) {
            throw Error(
              `Request isn't correct. Not enough data in line # ${index}`
            );
          }

          const key = request[index];

          // shift to the next array element
          index++;

          // retrieve the 'key'
          if (request[index].length < 2) {
            throw Error(
              `Request isn't correct. No enough arguments in line # ${index}`
            );
          }

          sizeOfData = Number(request[index].slice(1));

          // shift to the next array element
          index++;

          if (request[index].length < sizeOfData) {
            throw Error(
              `Request isn't correct. Not enough data in line # ${index}`
            );
          }

          const value = request[index];

          //TODO: проверить есть ли старое значение и у него px
          // if (store.has(key)) {

          // }
          // store.set(key, value);
          // console.log('[SET] key: ', key, ' value: ', store.get(key));
          // connection.write(simpleString + 'OK' + escapeSymbols);

          index++;

          // check if there are any OPTIONS
          if (request[index].length < 2) {
            // if no OPTIONS
            store.set(key, { value: value, timeToLive: null });
            console.log('[SET] key: ', key, ' value: ', store.get(key));
            connection.write(simpleString + 'OK' + escapeSymbols);

            break;
            throw Error(
              `Request isn't correct. No enough arguments in line # ${index}`
            );
          }

          sizeOfData = Number(request[index].slice(1));

          // shift to the next array element
          index++;

          if (request[index].length < sizeOfData) {
            throw Error(
              `Request isn't correct. Not enough data in line # ${index}`
            );
          }

          const options = request[index].toLowerCase();
          console.log('options: ', options);
          if (options === 'px') {
            index++;

            // retrieve the 'px' value
            if (request[index].length < 2) {
              throw Error(
                `Request isn't correct. No enough arguments in line # ${index}`
              );
            }

            sizeOfData = Number(request[index].slice(1));

            // shift to the next array element
            index++;

            if (request[index].length < sizeOfData) {
              throw Error(
                `Request isn't correct. Not enough data in line # ${index}`
              );
            }

            const expiry = Number(request[index]);

            // console.log('timeout: ', timeout);
            // const timeoutId = setTimeout(() => {
            //   store.delete(key);
            // }, timeout);
            const timeToLive = Date.now() + expiry;
            store.set(key, { value: value, timeToLive: timeToLive });
            console.log('[SET] key: ', key, ' value: ', store.get(key));
            connection.write(simpleString + 'OK' + escapeSymbols);
          }
          break;
        }
        case 'get': {
          // shift to the next array element
          index++;

          // retrieve the 'key'
          if (request[index].length < 2) {
            throw Error(
              `Request isn't correct. No enough arguments in line # ${index}`
            );
          }

          let sizeOfData = Number(request[index].slice(1));

          // shift to the next array element
          index++;

          if (request[index].length < sizeOfData) {
            throw Error(
              `Request isn't correct. Not enough data in line # ${index}`
            );
          }

          const key = request[index];

          // check expiry
          const data = store.get(key);

          if (!data) {
            connection.write(nullBulkString);
            console.log(
              '[GET]: no value by the key',
              key,
              ' response: ',
              nullBulkString
            );
            break;
          }

          const expiry = data.timeToLive;
          console.log('[expiry]: ', expiry);

          if (expiry) {
            const isExpired = expiry < Date.now();

            if (isExpired) {
              store.delete(key);
              connection.write(nullBulkString);
              console.log(
                '[GET]: key: ',
                key,
                ' has expired. Response: ',
                nullBulkString
              );
              break;
            }
          }

          const value = data.value;

          const respond = value
            ? bulkString + value.length + escapeSymbols + value + escapeSymbols
            : nullBulkString;
          console.log('[GET] key:', key, 'value: ', value);
          connection.write(respond);
          // 1714661600969 < 1714661751957
          // 1714661751957
          break;
        }
        case 'info': {
          index++;
          if (index > request.length) {
            //TODO:  случай, когда после Info нет аршументов
            console.log(
              '[Case when there is on arguments after INFO command. NO implementation done yet]'
            );
            break;
          }

          if (request[index].length < 2) {
            throw Error(
              `Request isn't correct. No enough arguments in line # ${index}`
            );
          }

          const sizeOfData = Number(request[index].slice(1));

          // shift to the next array element
          index++;

          if (request[index].length < sizeOfData) {
            throw Error(
              `Request isn't correct. Not enough data in line # ${index}`
            );
          }

          let options = request[index];
          // console.log('INFO argument is :', options);

          switch (options) {
            case 'replication': {
              const response = infoReplicationResponse();
              connection.write(response);
              break;
            }
            default: {
              console.log(
                '[Default of switch for options. NO implementation done yet for the options: ]',
                options
              );
              break;
            }
          }

          break;
        }
        default: {
          connection.write('+OK' + escapeSymbols);
        }
      }
    }
  });
});

server.listen(port, '127.0.0.1');

// *1\r\n$4\r\nping\r\n
// *2\r\n$4\r\necho\r\n$3\r\nhey\r\n

function infoReplicationResponse() {
  // const jsonString = JSON.stringify(serverInfo);
  // const response = jsonString.replace(/,/g, customDelimiter);

  const serverInfoString = JSON.stringify(serverInfo)
    .replaceAll(/["{}]/g, '')
    .replaceAll(/,/g, escapeSymbols)
    .replaceAll(/null/g, '');
  // console.log('serverInfoString: ', serverInfoString);

  // const serverInfoArray = serverInfoString.split(escapeSymbols);
  // console.log('serverInfoArray: ', serverInfoArray);

  // const responseArray: string[] = serverInfoArray.map((element: string) => {
  //   const raw =
  //     bulkString + element.length + escapeSymbols + element + escapeSymbols;
  //   return raw;
  // });
  // console.log('responseArray: ', responseArray);

  const response =
    bulkString +
    serverInfoString.length +
    escapeSymbols +
    serverInfoString +
    escapeSymbols;

  // console.log('Server info data to RESP format', response);
  return response;
}
