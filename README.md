# Tauri File Watcher

A file watching application built with Tauri and Express.js in a monorepo structure.

## Project Structure

- `client/`: Tauri desktop application frontend
- `server/`: Express.js backend that handles file watching

## Features

- Real-time file change monitoring
- Directory selection via native file picker
- Event streaming for file additions, modifications, and deletions
- Elegant UI with dark mode support

## Setup and Running

### Prerequisites

- Node.js (v14 or higher)
- npm
- Rust and Cargo (for Tauri)

### Installation

1. Install dependencies:

```bash
# From the project root
npm install
```

### Running the Application

Start both server and client concurrently:

```bash
# From the project root
npm run dev
```

Or run them separately:

```bash
# Start the server
npm run server

# In another terminal, start the client
npm run client
```

## Development

### Server (Express.js)

The server uses:

- Express.js for the REST API
- Chokidar for file system watching
- Server-Sent Events (SSE) for real-time updates

### Client (Tauri)

The client uses:

- Tauri for the desktop application framework
- Vanilla JavaScript for the UI
- Server-Sent Events for receiving real-time updates from the server

## License

MIT
