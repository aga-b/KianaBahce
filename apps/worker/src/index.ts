import { createServer } from "node:http";
const port = Number(process.env.PORT ?? 3101);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("Invalid PORT");
const server = createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  if (req.url !== "/health") {
    res.writeHead(404);
    res.end('{"error":"not_found"}');
    return;
  }
  res.end(JSON.stringify({ status: "ok", mode: "skeleton", version: "0.1.0" }));
});
server.listen(port, "0.0.0.0", () =>
  console.log(JSON.stringify({ event: "started", service: "worker", port })),
);
function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
