import { DBC, MPQ, std } from './launcher/globals.ts'

const { resolve } = std.path
const { crypto } = std.crypto
const { encodeBase64Url } = std.encoding
const encode = new TextEncoder().encode.bind(new TextEncoder())
const _decode = new TextDecoder().decode.bind(new TextDecoder())

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
  accountName: 'test', // TODO auto-set with discord link
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
  for await (const locale of Deno.readDir(`${config.wowDir}\\Data`)) {
    if (!locale.isDirectory) continue
    await Deno.writeTextFile(
      `${config.wowDir}\\Data\\${locale.name}\\realmlist.wtf`,
      `SET realmList ${defaultWTFConfig.realmList}\r\n`,
    )
  }

  const configPath = `${config.wowDir}\\WTF\\Config.wtf`
  const configFile = parseWTFConf(
    await Deno.readTextFile(configPath).catch(() => ''),
  )
  await Deno.writeTextFile(
    configPath,
    stringifyWTFConf({ ...configFile, ...defaultWTFConfig }),
  )

  new Deno.Command(`${config.wowDir}\\Wow.exe`, {
    args: [
      '-nosplash',
      // '-noredirect'
      // '-realm',
      // '-uid', // auth ??
    ],
  }).spawn()
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
const openDBC = (name: DBCName) => {
  if (!config.wowDir) throw Error('need to locate your wow directory first')
  for (const patchName of patchFiles) {
    let mpq: MPQ | undefined
    try {
      mpq = MPQ.open(`${config.wowDir}\\Data\\enUS\\${patchName}`)
      const file = mpq.getFile(`DBFilesClient\\${name}`)
      const buffer = new ArrayBuffer(file.size)
      if (file.read(buffer) !== file.size) throw Error('invalid dbc file size')
      return buffer
    } catch (err) {
      if ((err as any).type !== 'ERROR_FILE_NOT_FOUND') throw err
    } finally {
      mpq?.close()
    }
  }
  throw new Deno.errors.NotFound(`${name} not found`)
}

const applyPatch = async (updates: Updates) => {
  if (!config.wowDir) {
    return console.log('can not patch without a valid wow directory')
  }
  const tmpDir = await Deno.makeTempDir()
  const mpq = MPQ.create(`${tmpDir}\\patch-X.mpq`)
  await Promise.all(updates.map(async ({ data, replace, name }) => {
    const dbc = replace
      ? DBC.toBytes(name, data)
      : DBC.fromBytes(name, openDBC(name)).assign(data).toBytes()
    await Deno.writeFile(`${tmpDir}\\${name}`, dbc)
    mpq.addFile(`${tmpDir}\\${name}`, `DBFilesClient\\${name}`)
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
  const skills = []
  let skillStartId = 30_000

  // Professions
  for (const data of await getSheet('TAILORING')) {
    const {
      SkillLine, // "197",
      AcquireMethod, // "",
      CharacterPoints_1, // "",
      CharacterPoints_2, // "",
      ID, // "100015",
      EffectItemType_1, // "4315",
      Name_Lang_enUS, // "Reinforced Woolen Shoulders",
      Reagent_1, // "3839",
      ReagentCount_1, // "9",
      Reagent_2, // "2319",
      ReagentCount_2, // "2",
      Reagent_3, // "1705",
      ReagentCount_3, // "2",
      Reagent_4, // "2321",
      ReagentCount_4, // "1"
    } = data

    spells.push({
      ID,
      EffectItemType_1,
      Name_Lang_enUS,
      Reagent_1,
      ReagentCount_1,
      Reagent_2,
      ReagentCount_2,
      Reagent_3,
      ReagentCount_3,
      Reagent_4,
      ReagentCount_4,
    })

    skills.push({
      ID: skillStartId++,
      SkillLine,
      Spell: ID,
      AcquireMethod,
      CharacterPoints_1,
      CharacterPoints_2,
    })
  }

  return [
    { name: 'SkillLineAbility.dbc', data: skills },
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
const dispatch = async (data: unknown) => {
  controller || (controller = await events.promise)
  controller.enqueue(encode(`data: ${JSON.stringify(data)}\r\n\r\n`))
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
    const updates = await fetchUpdates()
    await applyPatch(updates)
    return OK
  },
  'GET/play': async () => {
    await startWoW()
    return OK
  },
  'GET/start-wow-dir-scan': async (req) => {
    if (!config.wowDir) {
      dispatch({ type: 'scan-start' })
      for await (const progress of scanWoWDir()) {
        if (req.signal.aborted) {
          console.log('Scan aborted')
          return OK
        }
        dispatch({ type: 'scan-progress', ...progress })
      }
      dispatch({ type: 'scan-complete', wowDir: config.wowDir })
    } else {
      dispatch({ type: 'scan-complete', wowDir: config.wowDir })
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

