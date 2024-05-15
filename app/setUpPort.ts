export function setUpPort() {
  const indexOfPortFlag = process.argv.indexOf('--port');

  let port = 6379;

  if (indexOfPortFlag !== -1 && process.argv[indexOfPortFlag + 1]) {
    port = Number(process.argv[indexOfPortFlag + 1]);
  }
  return port;
}
