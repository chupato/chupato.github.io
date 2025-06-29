export const dlls = [
  'StormLib',
  'webview',
  'WebView2Loader',
] as const

type PendingDllLocations = Promise<
  Record<(typeof dlls)[number] | 'dir', string>
>

let cached: PendingDllLocations | undefined
const init = async (): PendingDllLocations => {
  const dir = await Deno.makeTempDir()
  return Object.fromEntries([
    ['dir', dir],
    ...(await Promise.all(dlls.map(async (file) => {
      const target = `${dir}/${file}.dll`
      await Deno.copyFile(`${import.meta.dirname}/${file}.dll`, target)
      return [file, target]
    }))),
  ])
}

export const getDll = () => cached || (cached = init())
