import * as net from 'net';
import { store } from './store';
import {
  bulkString,
  escapeSymbols,
  simpleString,
  nullBulkString,
  minArgumentCount,
} from './constants';
import {
  createReplica,
  infoReplicationResponse,
  isArgumentHasEnoughLength,
  isArray,
  isCommandHasNoOptions,
  pingCommand,
  setUpPort,
} from './utils';

// Uncomment this block to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
  // Handle connection
  console.log('Server is running');
  createReplica(connection);

  connection.on('end', function () {
    console.log('client disconnected');
  });

  connection.on('data', (data: string | Buffer) => {
    let index = 0;

    // parse the request
    // split the arguments by escaping symbols
    const request = data.toString().toLowerCase().split(escapeSymbols);
    console.log('request: ', request);

    isArgumentHasEnoughLength(request[0], minArgumentCount);

    isArray(request[index][0]);

    const numberOfArguments = Number(request[index].slice(1));
    // console.log('numberOfArguments: ', numberOfArguments);

    // shift to the next array element
    index++;

    for (index; index <= numberOfArguments * 2; index++) {
      // check the following part of the request if there are enough arguments
      // e.g. $4/r/n where $-Bulk strings - length === 2 [1]
      isArgumentHasEnoughLength(request[index], minArgumentCount);

      const sizeOfData = Number(request[index].slice(1));

      // shift to the next array element
      index++;

      isArgumentHasEnoughLength(request[index], sizeOfData);

      // extract command from the request
      const command = request[index];

      switch (command) {
        case 'ping': {
          pingCommand(connection);
          break;
        }
        case 'echo': {
          index++;
          isArgumentHasEnoughLength(request[index], minArgumentCount);

          const sizeOfData = Number(request[index].slice(1));

          // shift to the next array element
          index++;

          isArgumentHasEnoughLength(request[index], sizeOfData);

          const data =
            bulkString +
            request[index].length +
            escapeSymbols +
            request[index] +
            escapeSymbols;

          console.log('data: ', data);
          connection.write(data);
          break;
        }
        case 'set': {
          // shift to the next array element
          index++;
          isArgumentHasEnoughLength(request[index], minArgumentCount);
          let sizeOfData = Number(request[index].slice(1));

          // shift to the next array element
          index++;
          isArgumentHasEnoughLength(request[index], sizeOfData);

          // retrieve the 'key'
          const key = request[index];

          // shift to the next array element
          index++;
          isArgumentHasEnoughLength(request[index], minArgumentCount);
          sizeOfData = Number(request[index].slice(1));

          // shift to the next array element
          index++;
          isArgumentHasEnoughLength(request[index], sizeOfData);

          // retrieve the 'value'
          const value = request[index];

          // shift to the next array element
          index++;

          // check if there are any OPTIONS
          if (isCommandHasNoOptions(request[index])) {
            // if no OPTIONS
            store.set(key, { value: value, timeToLive: null });
            console.log('[SET] key: ', key, ' value: ', store.get(key));
            connection.write(simpleString + 'OK' + escapeSymbols);
            break;
          }

          sizeOfData = Number(request[index].slice(1));

          // shift to the next array element
          index++;

          isArgumentHasEnoughLength(request[index], sizeOfData);

          const options = request[index].toLowerCase();
          // console.log('options: ', options);
          if (options === 'px') {
            // shift to the next array element
            index++;

            // retrieve the 'px' value
            isArgumentHasEnoughLength(request[index].length, 2);

            sizeOfData = Number(request[index].slice(1));

            // shift to the next array element
            index++;

            isArgumentHasEnoughLength(request[index].length, sizeOfData);

            const expiry = Number(request[index]);

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
          isArgumentHasEnoughLength(request[index], minArgumentCount);

          let sizeOfData = Number(request[index].slice(1));

          // shift to the next array element
          index++;

          isArgumentHasEnoughLength(request[index], sizeOfData);

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

          isArgumentHasEnoughLength(request[index], minArgumentCount);

          const sizeOfData = Number(request[index].slice(1));

          // shift to the next array element
          index++;

          isArgumentHasEnoughLength(request[index], sizeOfData);

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

server.listen(setUpPort(), '127.0.0.1');

server.on('error', (error: Error) => {
  console.log(`[error event]: `, error);
});
// *1\r\n$4\r\nping\r\n
// *2\r\n$4\r\necho\r\n$3\r\nhey\r\n
