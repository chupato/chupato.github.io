// Simple development proxy to bypass CORS for EventSource/API
const API_URL = "https://wow.devazuka.com"

export default {
  fetch: async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "access-control-allow-headers": "*",
      },
    })
  }
  const url = new URL(req.url)
  const response = await fetch(API_URL + url.pathname + url.search, {
    method: req.method,
    signal: req.signal,
    headers: req.headers,
    body: req.body,
  })
  const headers = new Headers(response.headers)
  headers.set("access-control-allow-origin", "*")
  return new Response(response.body, {
    status: response.status,
    headers,
  })
}
}