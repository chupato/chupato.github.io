import * as globals from './globals.ts'

Object.assign(globalThis, globals)

const OK = new Response(null, { status: 200 })

type Handler = (req: Request, url: URL) => Response | Promise<Response>
const routes: Record<string, Handler> = {}

routes['POST/routes'] = async (req) => {
  const makeHandler = new Function(`return (${await req.text()})()`)
  for (const [key, route] of Object.entries(await makeHandler())) {
    routes[key] = route as Handler
  }
  return OK
}

const port = Number(self.name)
Deno.serve({ port }, async (req: Request) => {
  const url = new URL(req.url)
  const route = routes[`${req.method}${url.pathname}`]
  if (!route) return new Response(null, { status: 404 })
  const res = await route(req, url)
  res.headers.set('Access-Control-Allow-Origin', '*')
  return res
})
