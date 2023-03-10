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
    const def = "https://jsonplaceholder.typicode.com/";
    const query = req.query.url;
    if (!query || !query.startsWith("http://") || !query.startsWith("https://")) return def;
    return query;
  },
};

function filter(pathname, req) {
  console.log(req.query.url)
  return req.query.url !== undefined
}

app.use(morgan("dev"));

app.use(createProxyMiddleware(filter, options));

// Info GET endpoint
app.get("/", (req, res, next) => {
  res.send("This is a proxy service.");
});

// Start the Proxy
app.listen(PORT, () => {
  console.log(`Starting Proxy at port ${PORT}`);
});
