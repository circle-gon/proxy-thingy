import express from "express";
import morgan from "morgan";
import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware";
import { isValidURL, slice, getFirst } from "./shared/utils.js";
import { fileURLToPath } from "node:url";

// path to where this file is located, may be used (or not)
// const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Create Express Server
const app = express();
const HEAD_INJECTION =
  '<script src="/injection.js?proxyresource" type="module"></script>';

// Configuration
const PORT = process.env.PORT;

const options = {
  changeOrigin: true,
  router(req) {
    return getFirst(req.url);
  },
  followRedirects: true,
  selfHandleResponse: true,
  onProxyRes: responseInterceptor(async (resBuffer, proxyRes, req, res) => {
    if (proxyRes.headers["content-type"]?.includes("text/html")) {
      return resBuffer
        .toString("utf-8")
        .replace("<head>", "<head>" + HEAD_INJECTION);
    }

    return resBuffer;
  }),
  cookieDomainRewrite: {
    "*": process.env.PROJECT_DOMAIN,
  },
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
