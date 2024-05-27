export function isArray(token: string) {
  if (token !== '*') {
    const errorText = 'Incorrect token. Expected *, but received: ' + token;
    throw new Error(errorText);
  }
  return;
}
