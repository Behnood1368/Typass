const express = require('express');
const tls = require('tls');
const dnsPacket = require('dns-packet');

const app = express();
const PORT = process.env.PORT || 3000;

const resolveDot = async (hostname, type = 'A') => {
  const packet = dnsPacket.encode({
    type: 'query',
    id: 1,
    flags: dnsPacket.RECURSION_DESIRED,
    questions: [{
      type,
      name: hostname
    }]
  });

  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: 'dns.google',
      port: 853,
      servername: 'dns.google'
    }, () => {
      const len = Buffer.alloc(2);
      len.writeUInt16BE(packet.length);
      socket.write(Buffer.concat([len, packet]));
    });

    let chunks = [];
    let expectedLength = null;

    socket.on('data', (data) => {
      chunks.push(data);
      const all = Buffer.concat(chunks);
      if (expectedLength === null && all.length >= 2) {
        expectedLength = all.readUInt16BE(0);
      }
      if (expectedLength !== null && all.length >= expectedLength + 2) {
        socket.end();
        const response = dnsPacket.decode(all.slice(2));
        resolve(response.answers);
      }
    });

    socket.on('error', reject);
  });
};

app.get('/resolve', async (req, res) => {
  const { name, type } = req.query;
  if (!name) return res.status(400).send({ error: "Missing ?name=..." });

  try {
    const answer = await resolveDot(name, type || 'A');
    res.json(answer);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "DNS resolution failed" });
  }
});

app.get('/', (req, res) => {
  res.send('DNS-over-TLS API is running. Use /resolve?name=example.com');
});

app.listen(PORT, () => {
  console.log(`DNS-over-TLS API running on port ${PORT}`);
});
