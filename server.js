import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = 4173;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png"
};

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  const name = pathname === "/" ? "index.html" : pathname.slice(1);
  const file = path.resolve(root, name);

  if (!file.toLowerCase().startsWith(root.toLowerCase())) {
    response.writeHead(403);
    response.end("Prohibido");
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("No encontrado");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    response.end(data);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`Celeritas disponible en http://127.0.0.1:${port}/`);
});
