import * as net from 'net';
import { writeAsync } from './utils/writeAsync';

export async function handleHandshakeProcess(slaveClient: net.Socket) {
  const ping = '*1\r\n$4\r\nPING\r\n';
  const replicaConfigFirst =
    '*3\r\n$8\r\nREPLCONF\r\n$14\r\nlistening-port\r\n$4\r\n6380\r\n';
  const replicaConfigSecond =
    '*3\r\n$8\r\nREPLCONF\r\n$4\r\ncapa\r\n$6\r\npsync2\r\n';
  const psync = `*3\r\n$5\r\nPSYNC\r\n$1\r\n?\r\n$2\r\n-1\r\n`;

  try {
    const replyToPing = await writeAsync(ping, slaveClient);
    console.log('[replyToPing]: ', replyToPing.toString());

    const replyToConfigPartOne = await writeAsync(
      replicaConfigFirst,
      slaveClient
    );
    console.log('[replyToConfigPartOne]: ', replyToConfigPartOne.toString());
    const replyToConfigPartTwo = await writeAsync(
      replicaConfigSecond,
      slaveClient
    );
    console.log('[replyToConfigPartTwo]: ', replyToConfigPartTwo.toString());

    await writeAsync(psync, slaveClient);
  } catch (error) {}
}
