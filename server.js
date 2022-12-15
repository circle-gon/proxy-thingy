import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

// Create Express Server
const app = express();

// Configuration
const PORT = 3000;
const API_SERVICE_URL = "https://discord.com/";
const middle = createProxyMiddleware({
    target: API_SERVICE_URL,
    changeOrigin: true,
    end(proxyRes, req, res) {
      console.log("berrrr")
    }
  });

app.use(morgan("dev"));

// Info GET endpoint
app.get("/info", (req, res, next) => {
  res.send("This is a proxy service.");
});

// Proxy endpoints
app.use("/", middle);
// Start the Proxy
app.listen(PORT, () => {
  console.log(`Starting Proxy at port ${PORT}`);
});
