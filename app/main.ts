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

  connection.on('data', (data) => {
    console.log(`Received: ${data}`);

    connection.write('+PONG\r\n');
    // connection.pipe(connection);
  });
});

server.listen(6379, '127.0.0.1');

// const server: net.Server = net.createServer((conn: net.Socket) => {
//     conn.setEncoding("utf8");
//     let dataBuffer: Buffer;
//     conn.on("data", (data) => {
//       if (dataBuffer) {
//         dataBuffer = Buffer.concat([dataBuffer, data]);
//       } else {
//         dataBuffer = data;
//       }
//       const command = dataBuffer.toString().toLowerCase();
//       conn.write(commands.get(command));
//   1
//     });
//   });
//   server.listen(6379, "127.0.0.1");
//   const commands: Map<string, string> = new Map();
//   1
//   commands.set("*1\r\n$4\r\nping\r\n", "+PONG\r\n");
//   server.listen(6379, "127.0.0.1", undefined, () => {
//     console.log("running on 6379");
//   });
