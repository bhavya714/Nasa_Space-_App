const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOST || '0.0.0.0'
const port = parseInt(process.env.PORT, 10) || 3000

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

console.log('🚀 NASA Bioscience Explorer Server Starting...')
console.log(`Environment: ${process.env.NODE_ENV}`)
console.log(`Host: ${hostname}`)
console.log(`Port: ${port}`)

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

  // Configure server timeouts for deployment platforms
  server.keepAliveTimeout = 120 * 1000 // 120 seconds
  server.headersTimeout = 120 * 1000 // 120 seconds

  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('❌ Failed to start server:', err)
      throw err
    }
    console.log(`✅ Server ready on http://${hostname}:${port}`)
    console.log('🌐 NASA Bioscience Explorer is live!')
  })

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully')
    server.close(() => {
      console.log('Process terminated')
    })
  })

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully')
    server.close(() => {
      console.log('Process terminated')
    })
  })
})