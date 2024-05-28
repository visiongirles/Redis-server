import * as net from 'net';

export let replicasList: Set<net.Socket> = new Set();
