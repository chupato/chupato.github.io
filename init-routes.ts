import { DBC, MPQ, std } from './launcher/globals.ts'

const { resolve } = std.path
const { crypto } = std.crypto
const { encodeBase64Url } = std.encoding
const encode = new TextEncoder().encode.bind(new TextEncoder())
const decode = new TextDecoder().decode.bind(new TextDecoder())

// -----------
// Config File
// -----------
const CFG_FILE = resolve('.chupato.config')
type Config = Record<string, unknown>

const config: Config = {}
const save = () => {
  Deno.writeTextFile(CFG_FILE, JSON.stringify(config, null, 2))
}
let saveTimeout: number
const setConfig = (k: string, v: any) => {
  clearTimeout(saveTimeout)
  config[k] = v
  saveTimeout = setTimeout(save, 50)
  return v
}

const assignConfig = (data: Record<string, any>) => {
  for (const [k, v] of Object.entries(data)) {
    setConfig(k, v)
  }
}

try {
  const savedConfig = JSON.parse(Deno.readTextFileSync(CFG_FILE))
  Object.assign(config, savedConfig)
} catch {
  // ignore errors loading config
}

try {
  Deno.statSync(config.tmpDir as string)
} catch {
  setConfig('tmpDir', Deno.makeTempDirSync())
}

// ----------------------------------------
// Scan drive to find a valid wow directory
// ----------------------------------------

const wowExeDirectories: { path: string, isValid: boolean }[] = []
const alreadyScanned = new Set()
const pathToScan: string[] = []
let abortScan = false
const addToScan = (path: string) => {
  const skip = alreadyScanned.has(path) ||
    path.includes('node_module') ||
    path.includes('AppData') ||
    path.includes('ProgramData') ||
    path.includes('PerfLogs')
  skip || pathToScan.push(path)
}
const PATCH3_SIZE = 100373935
const WOW_EXE_SIZE = 7699456
const WOW_EXE = 'E9h6j2jB8zLtLq0sjQsy1PA9NSFHvmRVMFY817jKiwg'
const isValidWowDir = async (path?: string | unknown) => {
  if (typeof path !== 'string') return false
  try {
    const patch3 = await Deno.stat(resolve(path, 'Data/enUS/patch-enUS-3.MPQ'))
    if (patch3.size !== PATCH3_SIZE) return false
    const bytes = await Deno.readFile(resolve(path, 'Wow.exe'))
    if (bytes.byteLength !== WOW_EXE_SIZE) return false
    const hash = await crypto.subtle.digest('BLAKE3', bytes)
    return encodeBase64Url(hash) === WOW_EXE
  } catch {
    return false
  }
}

const findWow335 = async (path: string) => {
  alreadyScanned.add(path)
  try {
    for await (const { isFile, isDirectory, name } of Deno.readDir(path)) {
      if (abortScan) return
      if (isFile && name.length === 7 && name.toLowerCase() === 'wow.exe') {
        const isValid = await isValidWowDir(path)
        wowExeDirectories.push({ path, isValid })
        if (isValid) return
      }
      if (isDirectory) {
        if (name[0] === '.' || name[0] === '$') continue
        const next = resolve(path, name)
        if (next.length < path.length) {
          continue
        }
        addToScan(next)
      }
    }
  } catch {
    // ignore errors, permissions
  }
}

const home = Deno.env.get('USERPROFILE') || Deno.env.get('HOME') || 'C:\\User'

// Dirs to scan in priority:
const priorityDirs = [
  resolve(home, 'Downloads'),
  resolve(home, 'Documents'),
  resolve(home, 'Desktop'),
  resolve(home),
]

const scanWoWDir = async function* () {
  let dir = resolve('.')
  abortScan = false
  while (dir && !abortScan) {
    yield { path: dir, wowExeDirectories }
    await findWow335(dir)
    const queues = [...Array(5).keys()].map(async () => {
      while (pathToScan.length) {
        const next = pathToScan.pop()
        if (!next) continue
        await findWow335(next)
      }
    })

    await Promise.all(queues)
    dir = priorityDirs.shift() || resolve(dir, '..')
    if (alreadyScanned.has(dir) && dir.endsWith(':\\')) {
      // TODO: scan other disks if any
      break
    }
  }
}

scanWoWDir.abort = () => abortScan = true

if (!(await isValidWowDir(config.wowDir))) {
  setConfig('wowDir', undefined)
}



// ---------
// Start WoW
// ---------
const defaultWTFConfig = {
  readTOS: '1',
  readEULA: '1',
  realmName: 'AzerothCore',
  realmList: '51.68.39.150',
  accountName: String(config.accountName || ''),
  // Idea: put password in the clip board and paste it into wow login ?
}

const parseWTFConf = (wtfConf: string): Record<string, string> =>
  Object.fromEntries(
    wtfConf.split('\n').filter(Boolean)
      .map((n) => {
        const [_, key, value] = n.split(/^SET\s+([a-zA-Z0-9_]+)\s+"([^"]+)/)
        return [key, value]
      }),
  )

const stringifyWTFConf = (conf: Record<string, string>) =>
  Object.entries(conf)
    .map(([key, value]) => `SET ${key} "${value}"`)
    .join('\r\n')

const startWoW = async () => {
  try {
    await Deno.remove(`${config.wowDir}\\Cache`, { recursive: true })
    log({ status: 'clear cache' })
  } catch(err) {
    log({ error: 'unable to clear cache', message: err.message })
  }
  log({ status: 'creating realmlist.wtf', realmList: defaultWTFConfig.realmList })
  for await (const locale of Deno.readDir(`${config.wowDir}\\Data`)) {
    if (!locale.isDirectory) continue
    log({ locale: locale.name })
    await Deno.writeTextFile(
      `${config.wowDir}\\Data\\${locale.name}\\realmlist.wtf`,
      `SET realmList ${defaultWTFConfig.realmList}\r\n`,
    ).catch((err) => log({ error: 'unable to save reamlist file', message: err.message, locale: locale.name }))
  }

  const configPath = `${config.wowDir}\\WTF\\Config.wtf`
  log({ path: configPath })
  const configFile = parseWTFConf(
    await Deno.readTextFile(configPath)
      .catch((err) => {
        log({ error: 'unable to read config file', message: err.message })
        return ''
      }),
  )
  log({ config: configFile })
  await Deno.writeTextFile(
    configPath,
    stringifyWTFConf({ ...configFile, ...defaultWTFConfig }),
  ).catch((err) => log({ error: 'unable to save config file', message: err.message }))
  log({ action: 'starting wow.exe...' })

  const wow = new Deno.Command(`${config.wowDir}\\Wow.exe`, {
    stderr: 'piped',
    stdout: 'piped',
    args: [
      '-nosplash',
      // '-noredirect'
      // '-realm',
      // '-uid', // auth ??
    ],
  }).spawn()
  const mux = new std.async.MuxAsyncIterator()
  mux.add(wow.stdout)
  mux.add(wow.stderr)
  for await (const data of mux) {
    log({ clientLog: decode(data) })
  }

}


// ----------------
// Patch the client
// ----------------
const patchFiles = [
  'patch-enUS-3.MPQ',
  'patch-enUS-2.MPQ',
  'patch-enUS.MPQ',
  'locale-enUS.MPQ',
]

type DBCName = Parameters<typeof DBC.toBytes>[0]
type DBCValues = Parameters<typeof DBC.toBytes>[1]
type Updates = { name: DBCName; data: DBCValues; replace?: boolean }[]
const openDBC = <T extends DBCName>(name: T) => {
  if (!config.wowDir) throw Error('need to locate your wow directory first')
  for (const patchName of patchFiles) {
    let mpq: MPQ | undefined
    try {
      mpq = MPQ.open(`${config.wowDir}\\Data\\enUS\\${patchName}`)
      const file = mpq.getFile(`DBFilesClient\\${name}`)
      const buffer = new ArrayBuffer(file.size)
      if (file.read(buffer) !== file.size) throw Error('invalid dbc file size')
      return DBC.fromBytes(name, buffer)
    } catch (err) {
      if ((err as any).type !== 'ERROR_FILE_NOT_FOUND') throw err
    } finally {
      mpq?.close()
    }
  }
  throw new Deno.errors.NotFound(`${name} not found`)
}

const makePatch = async (updates: Updates) => {
  const { tmpDir } = config
  try {
    // cleanup
    await Deno.remove(`${tmpDir}\\patch-X.mpq`)
  } catch {
    // ignore
  }
  const mpq = MPQ.create(`${tmpDir}\\patch-X.mpq`)
  const addDBC = async <T extends DBCName>(name: T, dbc: Uint8Array) => {
    await Deno.writeFile(`${tmpDir}\\${name}`, dbc)
    mpq.addFile(`${tmpDir}\\${name}`, `DBFilesClient\\${name}`)
  }

  // Remove enchant level requirements
  const spellItemEnchantment = openDBC('SpellItemEnchantment.dbc')
  for (const row of spellItemEnchantment.rows) {
    row.MinLevel = 0
  }
  await addDBC('SpellItemEnchantment.dbc', spellItemEnchantment.toBytes())

  await Promise.all(updates.map(async ({ data, replace, name }) => {
    const dbc = replace
      ? DBC.toBytes(name, data)
      : openDBC(name).assign(data).toBytes()
    await addDBC(name, dbc)
  }))

  mpq.close()
  return mpq.file
}

const sheetID = '11PVL9YA1lmCoqaIguKjwuDFX58e8hzAh6kzDXA4jBV4'
const getSheet = async (page: string) =>
  (await fetch(`https://opensheet.elk.sh/${sheetID}/${page}`)).json()

const fetchUpdates = async (): Promise<Updates> => {
  const talentData = getSheet('TALENT.DBC')

  const spells = []
  const skills = openDBC('SkillLineAbility.dbc')
  const bySpell: Record<string, (typeof skills.rows)[0]> = {}
  for (const skill of skills.rows) {
    bySpell[skill.Spell as string] = skill
    skill.AcquireMethod = 0
  }
  for (const row of await getSheet('PROFESSION')) {
  const skillReq = Number(row.ReqSkillRank)
    const {
      ID, // "100015",
      item, // "4315",
      new_name,// "Reinforced Woolen Shoulders",
      Reagent_1 = 0, // "3839",
      ReagentCount_1 = 0, // "9",
      Reagent_2 = 0, // "2319",
      ReagentCount_2 = 0, // "2",
      Reagent_3 = 0, // "1705",
      ReagentCount_3 = 0, // "2",
      Reagent_4 = 0, // "2321",
      ReagentCount_4 = 0, // "1"
    } = row

    spells.push({
      ID: Number(ID),
      EffectItemType_1: item,
      Name_Lang_enUS: new_name,
      Reagent_1, ReagentCount_1,
      Reagent_2, ReagentCount_2,
      Reagent_3, ReagentCount_3,
      Reagent_4, ReagentCount_4,
    })

    const skill = bySpell[ID]
    if (skill) {
      skill.TrivialSkillLineRankHigh = skillReq + 10
      skill.TrivialSkillLineRankLow = skillReq + 5
    }
  }

  return [
    { name: 'Spell.dbc', data: spells },
    {
      name: 'Talent.dbc',
      data: await talentData,
      replace: true,
    }
  ]
}

// ----------------------
// Connect with Interface
// ----------------------
const OK = new Response(null, { status: 204 })
let controller: ReadableStreamDefaultController<any> | undefined
const events = Promise.withResolvers<ReadableStreamDefaultController<any>>()
const log = (payload: unknown) => dispatch('log', payload)
const dispatch = async (type: string, payload: unknown) => {
  controller || (controller = await events.promise)
  controller.enqueue(encode(`data: ${JSON.stringify({ type, payload })}\r\n\r\n`))
}

type Handler = (req: Request, url: URL) => Response | Promise<Response>
// deno-lint-ignore no-unused-vars
const routes: Record<string, Handler> = {
  'GET/config': () =>
    new Response(JSON.stringify(config), {
      headers: { 'Content-Type': 'application/json' },
    }),
  'POST/config': async (req) => {
    assignConfig(await req.json())
    return OK
  },
  'GET/patch': async () => {
    try {
      log({ status: 'checking wow directory' })
      if (!config.wowDir) return new Response(null, { status: 400 })
      const updates = await fetchUpdates()
      log({ status: 'fetch updates' })
      const patchFile = await makePatch(updates)
      log({ status: 'build patch' })
      await Deno.copyFile(patchFile, `${config.wowDir}\\Data\\patch-X.mpq`)
      log({ status: 'write patch' })
    } catch (err) {
      log({ message: err.message, stack: err.stack })
    }
    return OK
  },
  'GET/play': async () => {
    try {
      await startWoW()
    } catch (err) {
      log({ message: err.message, stack: err.stack })
    }
    return OK
  },
  'GET/start-wow-dir-scan': async (req) => {
    if (!config.wowDir) {
      dispatch('scan-start', {})
      for await (const progress of scanWoWDir()) {
        if (req.signal.aborted) {
          console.log('Scan aborted')
          return OK
        }
        dispatch('scan-progress', { ...progress })
      }
      dispatch('scan-complete', { wowDir: config.wowDir })
    } else {
      dispatch('scan-complete', { wowDir: config.wowDir })
    }
    return OK
  },
  'GET/events': () => {
    const body = new ReadableStream({ start: events.resolve })
    return new Response(body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}

