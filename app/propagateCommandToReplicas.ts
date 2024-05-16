import { listOfReplicas } from './listOfReplicas';

export function propagateCommandToReplicas(data: string | Buffer) {
  listOfReplicas.forEach((replica) => {
    replica.write(data);
    // console.log('[propagateCommandToReplicas]: ', replica);
  });
}
