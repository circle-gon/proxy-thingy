import express from "express";
import morgan from "morgan";
import proxy from "http-proxy";

// Create Express Server
const app = express();
const proxyServer = proxy.createProxyServer();

// Configuration
const PORT = 3000;

app.use(morgan("dev"));

// Info GET endpoint
app.get("/info", (req, res, next) => {
  res.send("This is a proxy service.");
});

app.get("/", (req, res, next) => {
  const url = req.query.url
  proxyServer.web()
})
// Start the Proxy
app.listen(PORT, () => {
  console.log(`Starting Proxy at port ${PORT}`);
});
