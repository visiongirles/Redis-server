export function setStreamId() {
  const timestamp = Date.now().toString();
  return timestamp + '-' + '0';
}
