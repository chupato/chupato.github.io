import { Webview } from './webview.ts'
import { getDll } from './dll.ts'
import { setCurrentConsoleWindowState } from 'jsr:@svefro/win-console-window-state'

// Hide the console, --no-terminal doesn't work on windows
setCurrentConsoleWindowState(0) // * 0 = Hidden
try {
  // Get the git version, we act like a git to avoid rate limits
  const gitInfoRefsUrl ='https://github.com/chupato/chupato.github.io.git/info/refs?service=git-upload-pack'
  const gitAgent = { 'User-Agent': 'git/2.x.x', Accept: '*/*' }
  const infoRefs = (await fetch(gitInfoRefsUrl, { headers: gitAgent })).text()
  const head = infoRefs.split(' HEAD\x00')[0]
  const version = head?.slice(-40) || 'master'

  // Init the worker service and wait for the port
  const workerHref = new URL('./worker.ts', import.meta.url).href
  const worker = new Worker(workerHref, { type: 'module' })
  const workerLoading = Promise.withResolvers()
  worker.onmessage = workerLoading.resolve
  worker.onerror = workerLoading.reject
  const { data: { port } } = await workerLoading.promise

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
  console.log('The launcher failed to start:', err.message)
  console.log('Check your internet connection.')
}

// cleanup
try {
  const { dir } = await getDll()
  await Deno.remove(dir, { recursive: true })
} catch {
  // ignore
}