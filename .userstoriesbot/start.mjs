// Fork-only helper for the demo bot, never upstream.
// The docs dev server (`npm start`) picks its own port between 4000 and 4999 and has no port flag,
// so this starts it and forwards the port the bot asks for (argv[2]) to it.
import { spawn } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';

const port = Number(process.argv[2]);
const dev = spawn('npm', ['start'], { stdio: ['ignore', 'pipe', 'inherit'], env: { ...process.env, FORCE_COLOR: '0' } });
let target = 0;

dev.stdout.on('data', chunk => {
  process.stdout.write(chunk);
  const match = !target && /running at http:\/\/localhost:(\d+)/.exec(chunk.toString());
  if (!match) return;
  target = Number(match[1]);
  if (target === port) return;

  const server = http.createServer((req, res) => {
    // The dev server rewrites HTML after setting content-length, so the header is too large and a keep-alive
    // response never completes. Ask it to close the connection and drop the header so the page finishes loading.
    const headers = { ...req.headers, connection: 'close' };
    const upstream = http.request(
      { host: '127.0.0.1', port: target, path: req.url, method: req.method, headers, agent: false },
      response => {
        const { 'content-length': _, ...rest } = response.headers;
        res.writeHead(response.statusCode, rest);
        response.on('data', data => res.write(data));
        response.on('close', () => res.end());
      },
    );
    upstream.on('error', () => res.destroy());
    req.pipe(upstream);
  });
  server.on('upgrade', (req, socket, head) => {
    const upstream = net.connect(target, '127.0.0.1', () => {
      upstream.write(`${req.method} ${req.url} HTTP/1.1\r\n`);
      for (let i = 0; i < req.rawHeaders.length; i += 2) upstream.write(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}\r\n`);
      upstream.write('\r\n');
      upstream.write(head);
      upstream.pipe(socket).pipe(upstream);
    });
    upstream.on('error', () => socket.destroy());
    socket.on('error', () => upstream.destroy());
  });
  server.listen(port, '0.0.0.0', () => console.log(`Forwarding http://localhost:${port}/ to the dev server on ${target}`));
});

dev.on('exit', code => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => dev.kill(signal));
