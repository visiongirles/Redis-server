export function isArgumentHasEnoughLength(argument: any, size: number) {
  if (argument.length < size) {
    const message =
      "Request isn't correct. No enough arguments in type of data. Argument: " +
      argument +
      ', size: ' +
      size;
    throw Error(message);
  }
  return;
}
