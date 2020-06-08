const { spawn } = require("child_process");
const crypto = require("crypto");
const http = require("http");

const SECRET = process.env.NODE_SECRET;
const PORT = process.env.NODE_PORT || 8080;

function verifySignature(req, body) {
  const sig = req.headers["x-hub-signature"] || "";
  const hmac = crypto.createHmac("sha1", SECRET);
  const digest = Buffer.from("sha1=" + hmac.update(body).digest("hex"), "utf8");
  const checksum = Buffer.from(sig, "utf8");
  return (
    checksum.length === digest.length &&
    crypto.timingSafeEqual(digest, checksum)
  );
}

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const payload = JSON.parse(body);
      if (verifySignature(req, body)) {
        const cmd = spawn("./hello.sh");
        cmd.stdout.on("data", data => {
          console.log(`stdout: ${data}`);
        });

        cmd.stderr.on("data", data => {
          console.error(`stderr: ${data}`);
        });
        cmd.on("close", code => {
          console.log(`child process exited with code ${code}`);
        });
      } else {
        console.log("Invalid signature");
      }
      res.end("bye");
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT} 🚀`);
});
