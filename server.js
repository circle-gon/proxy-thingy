import express from "express";
import morgan from "morgan";
/*import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware";
import { readFileSync } from "node:fs";
import {isValidURL, slice} from "./shared/utils.js"*/
import {fileURLToPath} from "node:url"
import {Server} from "socket.io"
import {createServer} from "node:http"

// Create Express Server
const app = express();
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const http = createServer(app)
const server = new Server(http)

// Configuration
const PORT = 3000;
/*const SCRIPT_TAG = `<script type="module" src="/replaceHTML.js"></script>`;
const CONTENT_SECURITY_POLICY_BASE = "script-src https://adaptive-tricolor-whip.glitch.me/"
const IS_DEV = true

const options = {
  changeOrigin: true,
  router(req) {
    return getFirst(req.url);
  },
  selfHandleResponse: true,
  onProxyRes: responseInterceptor(async (resBuffer, proxyRes, req, res) => {
    const response = resBuffer.toString("utf-8");
    let csp = CONTENT_SECURITY_POLICY_BASE
    if (IS_DEV) csp += " 'unsafe-eval' https://cdn.jsdelivr.net/"
    res.setHeader("Content-Security-Policy", csp)
    return response.replace("<head>", "<head>" + SCRIPT_TAG);
  }),
  pathRewrite(path, req) {
    return slice(path).slice(1).join("/");
  },
};

function filter(pathname, req) {
  return isValidURL(getFirst(req.url));
}

function getFirst(url) {
  return decodeURIComponent(slice(url)[0]);
}*/

app.use(morgan("dev"));
//app.use(express.static("shared"))
//app.use(express.static("static"))
//app.use(createProxyMiddleware(filter, options));

/*app.get("/:url", (req, res) => {
  res.send(
    `URL "${req.params.url}" is not a valid url.`
  );
});*/

server.on("connection", (socket) => {
  console.log("someone connected")
})

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/static/index_io.html")
})

// Start the Proxy
server.listen(PORT, () => {
  console.log(`Starting Proxy at port ${PORT}`);
});
