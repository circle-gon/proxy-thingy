import express from "express";
import morgan from "morgan";
import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware";
import { readFileSync } from "node:fs";

// Create Express Server
const app = express();

// Configuration
const PORT = 3000;
const SCRIPT_TAG = `<script type="module" src="registerServiceWorker.js"></script>`;

const options = {
  changeOrigin: true,
  router(req) {
    return getFirst(req.url)
  },
  selfHandleResponse: true,
  onProxyRes: responseInterceptor(async (resBuffer, proxyRes, req, res) => {
    const response = resBuffer.toString("utf-8");
    return response.replace("<head>", "<head>" + SCRIPT_TAG);
  }),
  pathRewrite(path, req) {
    return slice(path).slice(1).join("/")
  }
};

function slice(url) {
  return url.slice(1).split("/")
}

function getFirst(url) {
  return decodeURIComponent(slice(url)[0]);
}

function filter(pathname, req) {
  const url = getFirst(req.url)
  //console.log(url)
  return url !== "" && isValidURL(url) && url.endsWith("/");
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

app.use(morgan("dev"));

registerScripts("sw.js", "registerServiceWorker.js")

app.use(createProxyMiddleware(filter, options));

app.get("/:url", (req, res) => {
  res.send(`URL "${req.params.url}" is not a valid url. Also, make sure that it ends with a /.`)
})

// Info GET endpoint
app.get("/", (req, res, next) => {
  res.send("This is a proxy service.");
});

// Start the Proxy
app.listen(PORT, () => {
  console.log(`Starting Proxy at port ${PORT}`);
});
