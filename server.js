import express from "express"
import morgan from "morgan"
import {createProxyMiddleware } from 'http-proxy-middleware'

// Create Express Server
const app = express();

// Configuration
const PORT = 3000;
const API_SERVICE_URL = "https://jsonplaceholder.typicode.com";

app.use(morgan('dev'));

// Info GET endpoint
app.get('/info', (req, res, next) => {
   res.send('This is a proxy service which proxies to Billing and Account APIs.');
});

// Proxy endpoints
app.use('/json_placeholder', createProxyMiddleware({
   target: API_SERVICE_URL,
   changeOrigin: true,
   pathRewrite: {
       [`^/json_placeholder`]: '',
   },
}));