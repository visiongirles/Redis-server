import { serverInfo } from './config';

export function isMasterServer() {
  return serverInfo.role === 'master';
}
