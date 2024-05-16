import * as net from 'net';

export let listOfReplicas: Set<net.Socket> = new Set();
