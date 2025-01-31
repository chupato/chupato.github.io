import { resolve } from 'jsr:@std/path/resolve'
const CFG_FILE = resolve('.chupato.config')

type Config = Record<string, unknown>

const configData: Config = {}
const save = () => {
  Deno.writeTextFile(CFG_FILE, JSON.stringify(configData, null, 2))
}

let saveTimeout: number
export const config = {
  getAll: () => configData,
  assign(data: Record<string, any>) {
    for (const [k, v] of Object.entries(data)) {
      clearTimeout(saveTimeout)
      configData[k] = v
      saveTimeout = setTimeout(save, 50)
    }
  },
} as const

try {
  const savedConfig = JSON.parse(Deno.readTextFileSync(CFG_FILE))
  Object.assign(configData, savedConfig)
} catch {
  // ignore errors loading config
}
