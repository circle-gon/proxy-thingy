import express from "express";
import morgan from "morgan";
import {createProxyMiddleware} from "http-proxy-middleware";

// Create Express Server
const app = express();
const ENDPOINT = "/api"

// Configuration
const PORT = 3000;
const options = {
  target: "https://trimps.github.io/",
  changeOrigin: true,
  pathRewrite: {
    ["^" + ENDPOINT]: ""
  } 
}

app.use(morgan("dev"));

// Info GET endpoint
app.get("/", (req, res, next) => {
  res.send("This is a proxy service.");
});

app.use(ENDPOINT, createProxyMiddleware(options))

// Start the Proxy
app.listen(PORT, () => {
  console.log(`Starting Proxy at port ${PORT}`);
});
