import { buildSync } from 'npm:esbuild'

export const build = (config?: Parameters<typeof buildSync>[0]) => {
  const html = Deno.readTextFileSync('./launcher-template.html')
  const code = buildSync({
    format: 'esm',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    bundle: false,
    ...config,
    write: false,
    entryPoints: { init: 'init-routes.ts' },
  }).outputFiles[0].text
  const start = code.indexOf('"./launcher/globals.ts";') + 24
  const withReturn = config?.minify
    ? code.replace(/},[A-Za-z0-9]={"GET\//, () => '}\n  return {"GET\/')
    : `${code}\n  return routes`
  return html.split('"" // ⚡').join(JSON.stringify(withReturn.slice(start)))
}
