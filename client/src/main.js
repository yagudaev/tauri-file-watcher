window.addEventListener('DOMContentLoaded', () => {
  window.__TAURI__.event.listen('file-added', e => {
    const div = document.createElement('div')
    div.innerHTML = `${new Date().toLocaleTimeString()} | ${e.payload}`
    document.querySelector('#events-list').prepend(div)
    postFileToServer(e.payload)
  })

  document.querySelector('#select-dir-btn').addEventListener('click', () => {
    window.__TAURI__.core
      .invoke('select_directory')
      .then(
        dir => dir && (document.querySelector('#selected-dir').textContent = `Watching: ${dir}`)
      )
      .catch(() => {})
  })
})

async function postFileToServer(filePath) {
  await fetch('http://localhost:3000/files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path: filePath }),
  })
}
