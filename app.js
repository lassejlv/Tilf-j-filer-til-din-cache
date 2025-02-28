
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('Service worker registered', reg))
    .catch(err => console.log('Service worker not registered', err));
}

function testOffline() {
  if (navigator.onLine) {
    console.log('App is currently online');
    fetch('https://jsonplaceholder.typicode.com/posts/1')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched data (will be cached):', data);
        document.getElementById('status').textContent = 'Online - Data fetched and cached';
      })
      .catch(err => {
        console.log('Fetch error:', err);
      });
  } else {
    console.log('App is currently offline');
    document.getElementById('status').textContent = 'Offline - Using cached data';
  }
}

window.addEventListener('online', () => {
  console.log('Going online');
  document.getElementById('network-status').textContent = 'Online';
  testOffline();
});

window.addEventListener('offline', () => {
  console.log('Going offline');
  document.getElementById('network-status').textContent = 'Offline';
  testOffline();
});


document.getElementById('network-status').textContent = navigator.onLine ? 'Online' : 'Offline';
testOffline();
