import { replicasList } from './constants/replicasList';

export function propagateCommandToReplicas(data: string | Buffer) {
  replicasList.forEach((replica) => {
    replica.write(data);
    // console.log('[propagateCommandToReplicas]: ', replica);
  });
}
