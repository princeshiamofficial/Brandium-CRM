import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Client } = require("ssh2");

const conn = new Client();
conn
  .on("ready", () => {
    console.log("Connected to CyberPanel via SSH...");
    conn.exec(
      "cd /home/crm.brandiumagency.com/public_html && git fetch origin main && git reset --hard origin/main && npm run build && pm2 restart brandium-crm",
      (err, stream) => {
        if (err) throw err;
        stream
          .on("close", (code) => {
            console.log("CyberPanel build finished with exit code: " + code);
            conn.end();
          })
          .on("data", (data) => console.log("" + data))
          .stderr.on("data", (data) => console.log("ERR: " + data));
      }
    );
  })
  .connect({
    host: "93.127.166.176",
    port: 22,
    username: "crmbr8784",
    password: "Brandium456",
  });
