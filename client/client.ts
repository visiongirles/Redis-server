// import * as net from 'net';

// var client = new net.Socket();
// client.connect(1337, '127.0.0.1', function () {
//   console.log('Connected');
//   client.write('Hello, server! Love, Client.');
// });

// client.on('data', function (data) {
//   console.log('Received: ' + data);
//   client.destroy(); // kill client after server's response
// });

// client.on('close', function () {
//   console.log('Connection closed');
// });

import { createClient } from 'redis';

const client = createClient();

// client.on('error', err => console.log('Redis Client Error', err));

await client.connect();
