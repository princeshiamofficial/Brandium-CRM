import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Client } = require("ssh2");

const conn = new Client();
conn
  .on("ready", () => {
    conn.exec(
      'mysql -u crm_brandium -pBrandium456 crm_brandium -e "SELECT id, name FROM users WHERE (is_deleted = 0 OR is_deleted IS NULL) AND (status = \'Active\' OR status IS NULL) ORDER BY name ASC;"',
      (err, stream) => {
        if (err) throw err;
        stream
          .on("close", () => conn.end())
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
