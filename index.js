const { UDPServer } = require('dns2');
const tls = require('tls');

const DOT_SERVER = {
  host: 'dns.google',
  port: 853,
  servername: 'dns.google'
};

const buildQueryBuffer = (question) => {
  const { DNSPacket } = require('dns2');
  const packet = DNSPacket.createQuery(question);
  return DNSPacket.write(packet);
};

const sendDoTQuery = (buffer) => {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(DOT_SERVER, () => {
      const length = Buffer.alloc(2);
      length.writeUInt16BE(buffer.length, 0);
      socket.write(Buffer.concat([length, buffer]));
    });

    socket.once('error', reject);

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
        resolve(all.slice(2, 2 + expectedLength));
      }
    });
  });
};

const server = UDPServer({
  udp: true,
  handle: async (request, send, rinfo) => {
    const question = request.questions[0];
    console.log(`Resolving ${question.name} (${question.type})`);

    try {
      const queryBuffer = buildQueryBuffer(question);
      const responseBuffer = await sendDoTQuery(queryBuffer);

      send(responseBuffer);
    } catch (err) {
      console.error("DNS resolution failed:", err);
    }
  }
});

server.listen(5353); // می‌تونی پورت رو به 53 تغییر بدی اگه دسترسی داشتی
console.log("Private DNS-over-TLS server listening on port 5353");
