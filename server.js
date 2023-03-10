import express from "express";
import morgan from "morgan";
import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware";
import { readFileSync } from "node:fs";
import {slice} from "./utils.js"

// Create Express Server
const app = express();

// Configuration
const PORT = 3000;
const SCRIPT_TAG = `<script type="module" src="/registerServiceWorker.js"></script>`;
const BASE_TAG = `<base href="." />`;
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
    const baseTag = `<base href="https://adaptive-tricolor-whip.glitch.me/https%3A%2F%2Fdiscord.com/">`;
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
  const url = getFirst(req.url);
  //console.log(url)
  return url !== "" && isValidURL(url) && req.url.endsWith("/");
}

function isValidURL(test) {
  let url;
  try {
    url = new URL(test);
  } catch (e) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function registerScripts(...names) {
  for (const name of names) {
    const n = "/" + name;
    app.get(n, (req, res) => {
      res.setHeader("Content-Type", "text/javascript");
      res.send(readFileSync("." + n));
    });
  }
}

function getFirst(url) {
  return decodeURIComponent(slice(url)[0]);
}

app.use(morgan("dev"));

registerScripts("sw.js", "registerServiceWorker.js", "utils.js");

app.use(createProxyMiddleware(filter, options));

app.get("/:url", (req, res) => {
  res.send(
    `URL "${req.params.url}" is not a valid url. Also, make sure that it ends with a /.`
  );
});

// Info GET endpoint
app.get("/", (req, res, next) => {
  res.send("This is a proxy service.");
});

// Start the Proxy
app.listen(PORT, () => {
  console.log(`Starting Proxy at port ${PORT}`);
});
