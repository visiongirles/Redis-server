import { serverInfo } from './constants/config';

export function isMasterServer() {
  return serverInfo.role === 'master';
}
