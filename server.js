import {createServer} from "http"
import {createProxyServer} from "http-proxy"

//
// Create a proxy server with custom application logic
//
const proxy = createProxyServer({});

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
const server = createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  proxy.web(req, res, { target: 'http://127.0.0.1:5050' });
});

console.log("listening on port 5050")
server.listen(3000);