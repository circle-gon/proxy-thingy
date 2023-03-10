import express from "express";
import morgan from "morgan";
import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware";
import {readFileSync} from "node:fs"

// Create Express Server
const app = express();

// Configuration
const PORT = 3000;
const SCRIPT_TAG = `<script type="module" src="sw.js"></script>`

const options = {
  changeOrigin: true,
  router(req) {
    return req.query.url;
  },
  selfHandleResponse: true,
  onProxyRes: responseInterceptor(async (resBuffer, proxyRes, req, res) => {
    const response = resBuffer.toString("utf-8");
    return response.replace("<head>", "<head>" + SCRIPT_TAG);
  }),
};

function filter(pathname, req) {
  const url = req.query.url;
  return url !== undefined && isValidURL(url);
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

function registerScript(name) {
  const n = "/" + name + ".js"
  app.get(n, (req, res) => {
    res.setHeader("Content-Type", "application/javascript")
    res.send(readFileSync("." + n))
  })
}

app.use(morgan("dev"));

app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript")
  res.send(readFileSync("./sw.js"))
})

app.get("/registerServiceWorker.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript")
  res.send(readFileSync("./registerServiceWorker.js"))
})

app.use(createProxyMiddleware(filter, options));

// Info GET endpoint
app.get("/", (req, res, next) => {
  const url = req.query.url;
  if (url !== undefined) {
    res.send(`URL "${url}" is not a valid URL! Please enter a valid url.`);
  } else {
    res.send("This is a proxy service.");
  }
});

// Start the Proxy
app.listen(PORT, () => {
  console.log(`Starting Proxy at port ${PORT}`);
});
