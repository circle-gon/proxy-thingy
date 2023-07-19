import express from "express";
import morgan from "morgan";
import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware";
import { isValidURL, slice, getFirst } from "./shared/utils.js";
import { fileURLToPath } from "node:url";
// import { readFileSync } from "node:fs";
//import { getCorrectURL } from "./replaceURL.js";

// path to where this file is located, may be used (or not)
// const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Create Express Server
const app = express();
const INJECTION = '<script src="/injection.js?proxyresource"></script>';
const CSP = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net/;"

// Configuration

// process.env.PORT is builtin
const PORT = process.env.PORT;

const options = {
  changeOrigin: true,
  router(req) {
    return getFirst(req.url);
  },
  selfHandleResponse: true,
  onProxyRes: responseInterceptor(async (resBuffer, proxyRes, req, res) => {
   /* console.log("PROXIED");
    console.log(
      `target: ${proxyRes.req.protocol}//${proxyRes.req.host}${proxyRes.req.path}`
    );
    console.log(proxyRes.headers["content-type"]);
    if (proxyRes.headers["content-type"]?.includes("text/html")) {
      //res.setHeader("Content-Security-Policy", CSP)
      return resBuffer
        .toString("utf-8")
        .replace("<head>", "<head>" + INJECTION);
    }*/

    return resBuffer;
  }),
  pathRewrite(path, req) {
    return slice(path).slice(1).join("/");
  },
};

function filter(pathname, req) {
  return isValidURL(getFirst(req.url));
}

app.use(morgan("dev"));

app.use(express.static("shared"));
app.use(express.static("static"));
app.use(createProxyMiddleware(filter, options));

app.get("/:url", (req, res) => {
  res.send(`URL "${req.params.url}" is not a valid url 
  (or it isn't percent encoded properly). Maybe you should
  go to <a href="/">home</a> instead?`);
});

// Start the Proxy
app.listen(PORT, () => {
  console.log(`Starting Proxy at port ${PORT}`);
});
