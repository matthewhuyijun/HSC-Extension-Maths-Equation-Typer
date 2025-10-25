const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { exec } = require("child_process");

const port = process.env.PORT || 5678;
const root = path.resolve(__dirname);

const defaultFile = "/html/index.html";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".txt": "text/plain; charset=utf-8"
};

function getFilePath(reqUrl) {
  const url = new URL(reqUrl, `http://localhost:${port}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") {
    pathname = defaultFile;
  }
  const filePath = path.normalize(path.join(root, pathname));
  if (!filePath.startsWith(root)) {
    return null;
  }
  return filePath;
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";
  fs.stat(filePath, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        send404(res);
      } else {
        send500(res, err);
      }
      return;
    }

    if (stats.isDirectory()) {
      sendFile(res, path.join(filePath, "index.html"));
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    const stream = fs.createReadStream(filePath);
    stream.on("error", (streamErr) => send500(res, streamErr));
    stream.pipe(res);
  });
}

function send404(res) {
  const notFoundPath = path.join(root, "html", "page404.html");
  fs.access(notFoundPath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
      return;
    }
    sendFile(res, notFoundPath);
  });
}

function send500(res, error) {
  console.error(error);
  res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("500 Internal Server Error");
}

const server = http.createServer((req, res) => {
  const filePath = getFilePath(req.url);
  if (!filePath) {
    send404(res);
    return;
  }
  sendFile(res, filePath);
});

server.listen(port, () => {
  const homepage = `http://localhost:${port}/html/index.html`;
  console.log(`Static server running at http://localhost:${port}`);
  if (!process.env.NO_OPEN) {
    if (process.platform === "darwin") {
      exec(`open "${homepage}"`);
    } else if (process.platform === "win32") {
      exec(`start "" "${homepage}"`);
    } else {
      exec(`xdg-open "${homepage}"`);
    }
  }
});
