import { configPath } from './constants/config';

export function setConfig() {
  const indexOfDirFlag = process.argv.indexOf('--dir');
  if (indexOfDirFlag !== -1) {
    configPath.dir = process.argv[indexOfDirFlag + 1];
  }

  const indexOfDbFilenameFlag = process.argv.indexOf('--dbfilename');
  if (indexOfDbFilenameFlag !== -1) {
    configPath.dbfilename = process.argv[indexOfDbFilenameFlag + 1];
  }
}
