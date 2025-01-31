
const url = new URL(location.href)
const version = url.pathname.split('/')[2] || 'master'
const port = url.searchParams.get('port')
if (!port) throw Error('Must be run with a port')

document.body.innerHTML += `<p><b>port:</b> <code>${port}</code></p><pre>${JSON.stringify(version)}</pre>`

const initRoutes = async () => {
  const c_str = str =>
    (str === null || str instanceof Uint8Array)
      ? str
      : new TextEncoder().encode(str + "\0")

  function getWebViewWindow() {
    const user32 = Deno.dlopen("user32.dll", {
      GetWindowLongPtrW: {
        parameters: ["pointer", "i32"],
        result: "i64",
      },
      SetWindowLongPtrW: {
        parameters: ["pointer", "i32", "i64"],
        result: "i64",
      },
      SetWindowPos: {
        parameters: ["pointer", "pointer", "i32", "i32", "i32", "i32", "u32"],
        result: "bool",
      },
      FindWindowA: {
        parameters: ["buffer", "buffer"],
        result: "pointer",
      },
      GetWindowRect: {
        parameters: ["pointer", "pointer"],
        result: "bool",
      },
    })

    const className = c_str('webview')
    const title = c_str('Chupato Launcher')
    const hWnd = user32.symbols.FindWindowA(className, title)
    if (!hWnd) return console.log('unable to find webview window')
    console.log('window found !')

    // Get the current window style
    const GWL_STYLE = -16 // Modify window style
    const style = user32.symbols.GetWindowLongPtrW(hWnd, GWL_STYLE)

    // Remove WS_CAPTION and WS_SYSMENU to hide the title bar
    const WS_CAPTION = 0x00C00000n
    const WS_SYSMENU = 0x00080000n
    const newStyle = style & ~(WS_CAPTION | WS_SYSMENU)
    user32.symbols.SetWindowLongPtrW(hWnd, GWL_STYLE, newStyle)

    // Apply the changes using SetWindowPos
    const SWP_NOSIZE = 0x0001
    const SWP_NOMOVE = 0x0002
    const SWP_NOZORDER = 0x0004
    const SWP_FRAMECHANGED = 0x0020
    user32.symbols.SetWindowPos(hWnd, null, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE | SWP_NOZORDER | SWP_FRAMECHANGED)


    // TODO: add a way to hook into

    return {
      position(deltaX, deltaY) {
        const RECT = new Int32Array(4)
        if (user32.symbols.GetWindowRect(hWnd, RECT)) {
          const [left, top, _right, _bottom] = RECT
          user32.symbols.SetWindowPos(
            hWnd,
            null,
            left + deltaX,
            top + deltaY,
            0,
            0,
            0x0001 | 0x0002 | 0x0004 // SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE
          )
        }
      },
      [Symbol.dispose]() {
        user32.close()
      }
    }
  }


  const webview = getWebViewWindow()
  return {
    'GET/hello': () => new Response('Hello\n')
  }
}

const routeInitRes = await fetch(`http://localhost:${port}/routes`, {
  method: 'POST',
  body: String(initRoutes),
})

console.log(routeInitRes)
