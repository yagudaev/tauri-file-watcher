// Ultra-minimal Tauri file watcher
window.addEventListener('DOMContentLoaded', () => {
  // Hide unused UI
  ['#server-status', '#start-watching-btn', '#stop-watching-btn'].forEach(id => 
    document.querySelector(id).style.display = 'none')
  
  // Listen for file events
  window.__TAURI__.event.listen('file-added', e => {
    const div = document.createElement('div')
    div.innerHTML = `${new Date().toLocaleTimeString()} | ${e.payload}`
    document.querySelector('#events-list').prepend(div)
  })

  // Select directory and start watching
  document.querySelector('#select-dir-btn').addEventListener('click', () => {
    window.__TAURI__.core.invoke('select_directory')
      .then(dir => dir && (document.querySelector('#selected-dir').textContent = `Watching: ${dir}`))
      .catch(() => {})
  })
})
