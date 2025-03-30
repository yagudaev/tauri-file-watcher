// Import Tauri API
const { invoke } = window.__TAURI__.core
const { open } = window.__TAURI__.dialog
const { appWindow } = window.__TAURI__.window

// Server configuration
const SERVER_URL = 'http://localhost:3000'
let eventSource = null
let selectedDirectory = null
let isWatching = false

// DOM elements
let selectDirBtn
let selectedDirText
let startWatchingBtn
let stopWatchingBtn
let serverStatus
let eventsList

// Connect to the server's event stream
function connectToEventStream() {
  if (eventSource) {
    eventSource.close()
  }

  eventSource = new EventSource(`${SERVER_URL}/events`)

  eventSource.onopen = () => {
    console.log('Connected to event stream')
    serverStatus.textContent = 'Server Status: Connected'
    serverStatus.classList.add('connected')
  }

  eventSource.addEventListener('connected', event => {
    console.log('Server confirmed connection')
  })

  eventSource.addEventListener('file-added', event => {
    const data = JSON.parse(event.data)
    addEventToList('Added', data.path)
  })

  eventSource.addEventListener('file-changed', event => {
    const data = JSON.parse(event.data)
    addEventToList('Changed', data.path)
  })

  eventSource.addEventListener('file-removed', event => {
    const data = JSON.parse(event.data)
    addEventToList('Removed', data.path)
  })

  eventSource.onerror = error => {
    console.error('EventSource error:', error)
    serverStatus.textContent = 'Server Status: Error connecting'
    serverStatus.classList.remove('connected')
    serverStatus.classList.add('error')
  }
}

// Add an event to the events list
function addEventToList(action, path) {
  const item = document.createElement('div')
  item.className = `event-item ${action.toLowerCase()}`

  const timestamp = new Date().toLocaleTimeString()
  item.innerHTML = `
    <span class="event-time">${timestamp}</span>
    <span class="event-action">${action}</span>
    <span class="event-path">${path}</span>
  `

  eventsList.prepend(item)

  // Limit the number of events shown
  if (eventsList.children.length > 100) {
    eventsList.removeChild(eventsList.lastChild)
  }
}

// Start watching the selected directory
async function startWatching() {
  if (!selectedDirectory) return

  try {
    const response = await fetch(`${SERVER_URL}/watch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ directory: selectedDirectory }),
    })

    const result = await response.json()

    if (response.ok) {
      isWatching = true
      updateWatchStatus()
      addEventToList('Info', `Started watching ${selectedDirectory}`)
    } else {
      console.error('Error starting watching:', result.error)
      addEventToList('Error', result.error)
    }
  } catch (error) {
    console.error('Error connecting to server:', error)
    addEventToList('Error', `Server connection failed: ${error.message}`)
  }
}

// Update the UI based on the watching status
function updateWatchStatus() {
  if (isWatching) {
    startWatchingBtn.disabled = true
    stopWatchingBtn.disabled = false
  } else {
    startWatchingBtn.disabled = !selectedDirectory
    stopWatchingBtn.disabled = true
  }
}

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  selectDirBtn = document.querySelector('#select-dir-btn')
  selectedDirText = document.querySelector('#selected-dir')
  startWatchingBtn = document.querySelector('#start-watching-btn')
  stopWatchingBtn = document.querySelector('#stop-watching-btn')
  serverStatus = document.querySelector('#server-status')
  eventsList = document.querySelector('#events-list')

  // Set up event listeners
  selectDirBtn.addEventListener('click', async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Directory to Watch',
      })

      if (selected) {
        selectedDirectory = selected
        selectedDirText.textContent = `Selected: ${selectedDirectory}`
        updateWatchStatus()
      }
    } catch (error) {
      console.error('Error selecting directory:', error)
    }
  })

  startWatchingBtn.addEventListener('click', startWatching)

  stopWatchingBtn.addEventListener('click', () => {
    isWatching = false
    updateWatchStatus()
    addEventToList('Info', `Stopped watching ${selectedDirectory}`)
  })

  // Connect to the server
  connectToEventStream()
})
