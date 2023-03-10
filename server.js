import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

// Create Express Server
const app = express();

// Configuration
const PORT = 3000;
const options = {
  changeOrigin: true,
  router(req) {
    return req.query.url
  },
  selfHandleResponse: true,
  onProxyRes(async (resBuffer, proxyRes, ))
};

function filter(pathname, req) {
  const url = req.query.url
  return url !== undefined && isValidURL(url)
}

function isValidURL(test) {
  let url
  try {
    url = new URL(test)
  } catch (e) {
    return false
  }
  return url.protocol === "http:" || url.protocol === "https:"
}

app.use(morgan("dev"));

app.use(createProxyMiddleware(filter, options));

// Info GET endpoint
app.get("/", (req, res, next) => {
  const url = req.query.url
  if (url !== undefined) {
    res.send(`URL "${url}" is not a valid URL! Please enter a valid url.`)
  } else {
    res.send("This is a proxy service.");
  }
});

// Start the Proxy
app.listen(PORT, () => {
  console.log(`Starting Proxy at port ${PORT}`);
});
