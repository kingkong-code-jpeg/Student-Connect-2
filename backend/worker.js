addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname === '/api/hello') {
    return new Response(JSON.stringify({ message: 'Hello from Worker!' }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response('Not Found', { status: 404 })
}
