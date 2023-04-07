import express from "express";
import morgan from "morgan";
import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware";
import {isValidURL, slice} from "./shared/utils.js"
import {fileURLToPath} from "node:url"
//import {Server} from "socket.io"
//import {createServer} from "node:http"

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Create Express Server
const app = express();
//const server = createServer(app)
// const io = new Server(server)

// Configuration
const PORT = 3000;
/*const SCRIPT_TAG = `<script type="module" src="/replaceHTML.js"></script>`;
const CONTENT_SECURITY_POLICY_BASE = "script-src https://adaptive-tricolor-whip.glitch.me/"
const IS_DEV = true*/

const options = {
  changeOrigin: true,
  router(req) {
    return getFirst(req.url);
  },
  /*selfHandleResponse: true,
  onProxyRes: responseInterceptor(async(resBuffer, proxyRes, req, res) => {
    //let csp = CONTENT_SECURITY_POLICY_BASE
    //if (IS_DEV) csp += " 'unsafe-eval' https://cdn.jsdelivr.net/"
    //res.setHeader("Content-Security-Policy", csp)
    res.statusCode = 200
    return resBuffer.toString("utf8")
  }),*/
  pathRewrite(path, req) {
    return slice(path).slice(1).join("/");
  }
};

function filter(pathname, req) {
  return isValidURL(getFirst(req.url));
}

function getFirst(url) {
  return decodeURIComponent(slice(url)[0]);
}

app.use(morgan("dev"));
app.use(express.static("shared"))
app.use(express.static("static"))
app.use(createProxyMiddleware(filter, options));

app.get("/:url", (req, res) => {
  res.send(
    `URL "${req.params.url}" is not a valid url.`
  );
});

/*io.on("connection", (socket) => {
  console.log("someone connected")
})

app.get("/pong", (req, res) => {
  res.send("Ping!")
})

app.use(express.static("io-static"))*/

// Start the Proxy
app.listen(PORT, () => {
  console.log(`Starting Proxy at port ${PORT}`);
});
