const express = require('express')
const cors = require('cors')
const chokidar = require('chokidar')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

let clients = []

const sendEventToClients = (event, data) => {
  clients.forEach(client => {
    client.res.write(`event: ${event}\n`)
    client.res.write(`data: ${JSON.stringify(data)}\n\n`)
  })
}

// SSE endpoint for clients to connect
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  res.write('event: connected\n')
  res.write('data: {"status":"connected"}\n\n')

  const clientId = Date.now()
  const newClient = {
    id: clientId,
    res,
  }
  clients.push(newClient)

  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId)
    console.log(`Client ${clientId} disconnected, ${clients.length} remaining`)
  })
})

// API endpoint to start watching a directory
app.post('/watch', (req, res) => {
  const { directory } = req.body

  if (!directory) {
    return res.status(400).json({ error: 'Directory path is required' })
  }

  try {
    // Initialize watcher
    const watcher = chokidar.watch(directory, {
      ignored: /(^|[\/\\])\../, // Ignore dotfiles
      persistent: true,
    })

    console.log(`Starting to watch: ${directory}`)

    // Add event listeners
    watcher
      .on('add', path => {
        console.log(`File ${path} has been added`)
        sendEventToClients('file-added', { path })
      })
      .on('change', path => {
        console.log(`File ${path} has been changed`)
        sendEventToClients('file-changed', { path })
      })
      .on('unlink', path => {
        console.log(`File ${path} has been removed`)
        sendEventToClients('file-removed', { path })
      })

    return res.json({
      status: 'success',
      message: `Now watching ${directory}`,
    })
  } catch (error) {
    console.error('Error watching directory:', error)
    return res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
