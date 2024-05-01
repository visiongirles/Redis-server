import * as net from 'net';

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log('Logs from your program will appear here!');

// Uncomment this block to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
  // Handle connection

  connection.on('end', function () {
    console.log('client disconnected');
  });

  //   connection.write('+PONG\r\n');
  //   connection.pipe(connection);

  connection.on('data', (data: string | Buffer) => {
    // [numberOfArguments]/r/n[]

    //request example: *2\r\n\$4\r\nPING\r\n\$4\r\nPING\r\n
    // [0] *2\r\n *-array length === 2   [1] !== 0
    // $4\r\n $-Bulk strings - length === 2 [1]
    // PING\r\n\$4\r\nPING\r\n length === [1]

    //TODO: предусмотреть вариант, когда запрос приходит не целиком. ь.е. надо сохранить, что получили  и дождаться продолжения запроса

    const escapeSymbols: string = '\r\n';
    const ping = 'ping';
    let index = 0;

    const request = data.toString().toLowerCase().split(escapeSymbols);
    console.log('request: ', request);
    if (request[0].length < 2)
      throw Error("Request isn't correct. No enough arguments in type of data");

    const typeOfData: string = request[index][0]; // e.g. * which means array
    console.log('typeOfData: ', typeOfData);

    // const numberOfArguments: number = Number(request[0][1]);
    const numberOfArguments = Number(request[index].slice(1));
    console.log('numberOfArguments: ', numberOfArguments);

    index++;
    // shift to the next array element
    for (index; index <= numberOfArguments * 2; index++) {
      // e.g. $4/r/n where $-Bulk strings - length === 2 [1]

      // console.log('request[1]: ', request[index]);
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

      const command = request[index];
      // console.log('data: ', command);

      switch (command) {
        case 'ping': {
          connection.write('+PONG\r\n');

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

          const data = request[index];
          connection.write(data);
          break;
        }
        default: {
          connection.write('OK');
        }
      }
    }

    // console.log(`Received: ${data}`);

    // connection.pipe(connection);
  });
});

server.listen(6379, '127.0.0.1');

// *1\r\n$4\r\nping\r\n
// *2\r\n$4\r\necho\r\n$3\r\nhey\r\n
