import express from "express";
import morgan from "morgan";
import {createProxyMiddleware} from "http-proxy-middleware";

// Create Express Server
const app = express();

// Configuration
const PORT = 3000;

app.use(morgan("dev"));

// Info GET endpoint
app.get("/info", (req, res, next) => {
  res.send("This is a proxy service.");
});

app.use(createProxyMiddleware({
  
}))

// Start the Proxy
app.listen(PORT, () => {
  console.log(`Starting Proxy at port ${PORT}`);
});
