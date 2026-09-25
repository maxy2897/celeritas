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
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2"
};

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  } catch {
    response.writeHead(400, securityHeaders);
    response.end("Petición no válida");
    return;
  }
  const name = pathname === "/" ? "index.html" : pathname.slice(1);
  const file = path.resolve(root, name);
  const relative = path.relative(root, file);
  const outsideRoot = !relative || relative.startsWith("..") || path.isAbsolute(relative);
  const hiddenPath = relative.split(path.sep).some((part) => part.startsWith("."));

  if (outsideRoot || hiddenPath) {
    response.writeHead(403, securityHeaders);
    response.end("Prohibido");
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404, securityHeaders);
      response.end("No encontrado");
      return;
    }

    response.writeHead(200, {
      ...securityHeaders,
      "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    response.end(data);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`Celeritas disponible en http://127.0.0.1:${port}/`);
});
