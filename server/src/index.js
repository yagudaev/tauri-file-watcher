const express = require('express')
const cors = require('cors')
const chokidar = require('chokidar')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Store files, fake database
let files = []

// POST /files body: { path: string }
// RESPONSE: 200 OK { status: 'success' }
app.post('/files', (req, res) => {
  const { path } = req.body
  files.push(path)
  res.status(200).send({ status: 'success' })
})

// GET /files
// RESPONSE: 200 OK { files: string[] }
app.get('/files', (req, res) => {
  res.status(200).send({ files })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
