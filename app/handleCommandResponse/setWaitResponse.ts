import * as net from 'net';
import { getAck } from '../getAck';
import { serverInfo } from '../constants/config';
import { replicasList } from '../constants/replicasList';
import { escapeSymbols } from '../constants/constants';

export async function setWaitResponse(
  commandOptions: string[],
  connection: net.Socket
) {
  const timeout = Number(commandOptions[1]);
  const data = `*3\r\n$8\r\nREPLCONF\r\n$6\r\nGETACK\r\n$1\r\n*\r\n`;

  try {
    const responses = await getAck(data, timeout);

    const numberOfAliveReplicas = responses.filter(
      (response) => response.toString() !== `replica is dead`
    );

    const response =
      serverInfo.master_repl_offset === 0
        ? replicasList.size
        : numberOfAliveReplicas.length;

    connection.write(`:${response}` + escapeSymbols);
  } catch (error) {
    console.log('[ERROR from WAIT getAck()]: ', error);
  }
}
