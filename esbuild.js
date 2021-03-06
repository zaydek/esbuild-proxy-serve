const esbuild = require("esbuild")
const http = require("http")
const p = require("path")

// The port the user sees and the port esbuild uses.
const userPort = 3000
const esbuildPort = userPort + 10

// spaify converts a URL for SPA-mode.
function spaify(path) {
	return "/"
}

// ssgify converts a URL for SSG-mode.
function ssgify(path) {
	if (path.endsWith("/")) return path + "index.html"
	if (p.extname(path) === "") return path + ".html"
	return path
}

// The proxy server.
const proxySrv = http.createServer((req, res) => {
	// The proxy request.
	const proxyReq = http.request({ ...req, path: spaify(req.url), port: esbuildPort }, proxyRes => {
		// The proxy response.
		if (proxyRes.statusCode === 404) {
			res.writeHead(200, { "Content-Type": "text/html" })
			res.end("<h1>404 Page Not Found</h1>")
		} else {
			res.writeHead(proxyRes.statusCode, proxyRes.headers)
			proxyRes.pipe(res, { end: true })
		}
	})
	req.pipe(proxyReq, { end: true })
})
proxySrv.listen(userPort)

esbuild.serve({
	port: esbuildPort,
	servedir: "www",
	onRequest: args => {
		console.log({ args })
	},
})
