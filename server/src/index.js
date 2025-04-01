const express = require('express')
const cors = require('cors')
const chokidar = require('chokidar')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 3000
const DB_FILE_PATH = path.join(__dirname, 'files.db')

clearDBFile()

app.use(cors())
app.use(express.json())

// POST /files body: { path: string }
// RESPONSE: 200 OK { status: 'success' }
app.post('/files', (req, res) => {
  const { path: filePath } = req.body
  appendPathToDB(filePath)
  res.status(200).send({ status: 'success' })
})

// GET /files
// RESPONSE: 200 OK { files: string[] }
app.get('/files', (req, res) => {
  const files = readPathsFromDB()
  res.status(200).send({ files })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

function clearDBFile() {
  fs.writeFileSync(DB_FILE_PATH, '', 'utf8')
}

function appendPathToDB(filePath) {
  console.log('[node] Adding path to DB:', filePath)
  fs.appendFileSync(DB_FILE_PATH, filePath + '\n', 'utf8')
}

function readPathsFromDB() {
  console.log('[node] Reading paths from DB')
  const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf8')
  return fileContent.split('\n').filter(line => line.trim() !== '')
}
