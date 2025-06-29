import { parseArgs } from 'jsr:@std/cli/parse-args'
import { build } from './build.ts'

const args = parseArgs(Deno.args)
const port = String(args.port)
const launch = new Deno.Command('deno', {
  stderr: 'inherit',
  stdout: 'inherit',
  args: [
    'run',
    '-A',
    'launcher/launcher.ts',
    ...['--port', port],
  ],
})

let child: Deno.ChildProcess
export default {
  fetch(request: Request) {
    const url = new URL(request.url)
    if (url.searchParams.get('port') === port) {
      child?.kill()
      child = launch.spawn()
      return new Response(build(), { headers: { 'Content-Type': 'text/html' } })
    }
    const headers = { Location: `/?port=${port}` }
    return new Response(null, { status: 302, headers })
  },
}
