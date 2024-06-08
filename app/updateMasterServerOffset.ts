import { serverInfo } from './constants/config';

export function updateMasterServerOffset(newOffset: number) {
  serverInfo.master_repl_offset += newOffset;
}
