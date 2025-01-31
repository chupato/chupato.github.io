import { Webview } from './webview.ts'
import { getDll } from './dll.ts'
import { parseArgs } from 'jsr:@std/cli/parse-args'
import { setCurrentConsoleWindowState } from 'jsr:@svefro/win-console-window-state'

const getFreePort = () => {
  using listener = Deno.listen({ port: 0 })
  return listener.addr.port
}

// Get Port
const args = parseArgs(Deno.args)
const port = Number(args.port) || getFreePort()

// Init the worker service
const workerHref = new URL('./worker.ts', import.meta.url).href
const worker = new Worker(workerHref, { type: 'module', name: String(port) })

const initWebView = async () => {
  try {
    // Hide the console, --no-terminal doesn't work on windows
    setCurrentConsoleWindowState(0) // * 0 = Hidden

    // Get the git version, we act like a git to avoid rate limits
    const gitInfoRefsUrl =
      'https://github.com/chupato/chupato.github.io.git/info/refs?service=git-upload-pack'
    const gitAgent = { 'User-Agent': 'git/2.x.x', Accept: '*/*' }
    const infoRefs = await fetch(gitInfoRefsUrl, { headers: gitAgent })
    const head = (await infoRefs.text()).split(' HEAD\x00')[0]
    const version = head?.slice(-40) || 'master'

    // Start the webview
    const url = [
      'https://rawcdn.githack.com', // CDN
      'chupato/chupato.github.io', // org/repo
      version,
      `launcher.html?port=${port}`,
    ].join('/')

    const webview = new Webview()
    webview.navigate(url)
    webview.title = 'Chupato Launcher'
    webview.run()
    worker.terminate()
  } catch (err) {
    setCurrentConsoleWindowState(5)
    console.log('The launcher failed to start:', (err as Error)?.message)
    console.log('Check your internet connection.')
  }
}

// Run headless mode if a port is given, dev mode
args.port || await initWebView()

// cleanup
try {
  const { dir } = await getDll()
  await Deno.remove(dir, { recursive: true })
} catch {
  // ignore
}
