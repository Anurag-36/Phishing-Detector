export function isIpHostname(host) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
}
