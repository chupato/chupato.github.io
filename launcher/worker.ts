import { MPQ } from './mpq.ts'
import * as DBC from './dbc.ts'
import * as std from './std.ts'

Object.assign(globalThis, { MPQ, DBC, std })

const listener = Deno.listen({ port: 0 })
const { port } = listener.addr
listener.close()

const OK = new Response(null, { status: 200 })

type Handler = (req: Request, url: URL) => Response | Promise<Response>
const routes: Record<string, Handler> = {}

routes['POST/routes'] = async (req) => {
  const makeHandler = new Function(await req.text())
  for (const [key, route] of Object.entries(await makeHandler())) {
    routes[key] = route as Handler
  }
  return OK
}

const handleRequest = (req: Request) => {
  const url = new URL(req.url)
  const route = routes[`${req.method}${url.pathname}`]
  if (!route) return new Response(null, { status: 404 })
  return route(req, url)
}

const serverStart = Promise.withResolvers()
const server = Deno.serve(
  { port, onListen: serverStart.resolve },
  handleRequest,
)

await serverStart.promise
if ('postMessage' in self && typeof self.postMessage === 'function') {
  self.postMessage({ port: server.addr.port })
}
