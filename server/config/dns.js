import dns from 'node:dns';
import { isIP } from 'node:net';

export function configureDnsServers(value = process.env.DNS_SERVERS, dnsResolver = dns) {
  if (value === undefined || value === null || value.trim() === '') return false;

  const servers = value.split(',').map((server) => server.trim());
  if (servers.some((server) => !server || isIP(server) === 0)) {
    throw new Error('DNS_SERVERS must be a comma-separated list of IP addresses.');
  }

  dnsResolver.setServers(servers);
  return true;
}
