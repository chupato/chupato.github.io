import { DBC, MPQ, std } from './launcher/globals.ts'

const { resolve } = std.path
const { crypto } = std.crypto
const { encodeBase64Url } = std.encoding
const encode = new TextEncoder().encode.bind(new TextEncoder())
const decode = new TextDecoder().decode.bind(new TextDecoder())

// -----------
// DBC Schemas
// -----------
const dbcSchemas: { [k in string]: DBC.Schema } = {
  'SkillLine.dbc': {
    ID: 'int',
    CategoryID: 'int',
    SkillCostsID: 'int',
    DisplayName_Lang_enUS: 'string',
    DisplayName_Lang_enGB: 'string',
    DisplayName_Lang_koKR: 'string',
    DisplayName_Lang_frFR: 'string',
    DisplayName_Lang_deDE: 'string',
    DisplayName_Lang_enCN: 'string',
    DisplayName_Lang_zhCN: 'string',
    DisplayName_Lang_enTW: 'string',
    DisplayName_Lang_zhTW: 'string',
    DisplayName_Lang_esES: 'string',
    DisplayName_Lang_esMX: 'string',
    DisplayName_Lang_ruRU: 'string',
    DisplayName_Lang_ptPT: 'string',
    DisplayName_Lang_ptBR: 'string',
    DisplayName_Lang_itIT: 'string',
    DisplayName_Lang_Unk: 'string',
    DisplayName_Lang_Mask: 'uint',
    Description_Lang_enUS: 'string',
    Description_Lang_enGB: 'string',
    Description_Lang_koKR: 'string',
    Description_Lang_frFR: 'string',
    Description_Lang_deDE: 'string',
    Description_Lang_enCN: 'string',
    Description_Lang_zhCN: 'string',
    Description_Lang_enTW: 'string',
    Description_Lang_zhTW: 'string',
    Description_Lang_esES: 'string',
    Description_Lang_esMX: 'string',
    Description_Lang_ruRU: 'string',
    Description_Lang_ptPT: 'string',
    Description_Lang_ptBR: 'string',
    Description_Lang_itIT: 'string',
    Description_Lang_Unk: 'string',
    Description_Lang_Mask: 'uint',
    SpellIconID: 'int',
    AlternateVerb_Lang_enUS: 'string',
    AlternateVerb_Lang_enGB: 'string',
    AlternateVerb_Lang_koKR: 'string',
    AlternateVerb_Lang_frFR: 'string',
    AlternateVerb_Lang_deDE: 'string',
    AlternateVerb_Lang_enCN: 'string',
    AlternateVerb_Lang_zhCN: 'string',
    AlternateVerb_Lang_enTW: 'string',
    AlternateVerb_Lang_zhTW: 'string',
    AlternateVerb_Lang_esES: 'string',
    AlternateVerb_Lang_esMX: 'string',
    AlternateVerb_Lang_ruRU: 'string',
    AlternateVerb_Lang_ptPT: 'string',
    AlternateVerb_Lang_ptBR: 'string',
    AlternateVerb_Lang_itIT: 'string',
    AlternateVerb_Lang_Unk: 'string',
    AlternateVerb_Lang_Mask: 'uint',
    CanLink: 'int',
  },
  'SkillLineAbility.dbc': {
    ID: 'uint',
    SkillLine: 'uint',
    Spell: 'uint',
    RaceMask: 'uint',
    ClassMask: 'uint',
    ExcludeRace: 'uint',
    ExcludeClass: 'uint',
    MinSkillLineRank: 'uint',
    SupercededBySpell: 'uint',
    AcquireMethod: 'uint',
    TrivialSkillLineRankHigh: 'uint',
    TrivialSkillLineRankLow: 'uint',
    CharacterPoints_1: 'uint',
    CharacterPoints_2: 'uint',
  },
  'SpellItemEnchantment.dbc': {
    ID: 'int',
    Charges: 'int',
    Effect_1: 'int',
    Effect_2: 'int',
    Effect_3: 'int',
    EffectPointsMin_1: 'int',
    EffectPointsMin_2: 'int',
    EffectPointsMin_3: 'int',
    EffectPointsMax_1: 'int',
    EffectPointsMax_2: 'int',
    EffectPointsMax_3: 'int',
    EffectArg_1: 'int',
    EffectArg_2: 'int',
    EffectArg_3: 'int',
    Name_Lang_enUS: 'string',
    Name_Lang_enGB: 'string',
    Name_Lang_koKR: 'string',
    Name_Lang_frFR: 'string',
    Name_Lang_deDE: 'string',
    Name_Lang_enCN: 'string',
    Name_Lang_zhCN: 'string',
    Name_Lang_enTW: 'string',
    Name_Lang_zhTW: 'string',
    Name_Lang_esES: 'string',
    Name_Lang_esMX: 'string',
    Name_Lang_ruRU: 'string',
    Name_Lang_ptPT: 'string',
    Name_Lang_ptBR: 'string',
    Name_Lang_itIT: 'string',
    Name_Lang_Unk: 'string',
    Name_Lang_Mask: 'uint',
    ItemVisual: 'int',
    Flags: 'int',
    Src_ItemID: 'int',
    Condition_Id: 'int',
    RequiredSkillID: 'int',
    RequiredSkillRank: 'int',
    MinLevel: 'int',
  },
  'Spell.dbc': {
    ID: 'int',
    Category: 'uint',
    DispelType: 'uint',
    Mechanic: 'uint',
    Attributes: 'uint',
    AttributesEx: 'uint',
    AttributesEx2: 'uint',
    AttributesEx3: 'uint',
    AttributesEx4: 'uint',
    AttributesEx5: 'uint',
    AttributesEx6: 'uint',
    AttributesEx7: 'uint',
    ShapeshiftMask: 'uint',
    unk_320_2: 'int',
    ShapeshiftExclude: 'uint',
    unk_320_3: 'int',
    Targets: 'uint',
    TargetCreatureType: 'uint',
    RequiresSpellFocus: 'uint',
    FacingCasterFlags: 'uint',
    CasterAuraState: 'uint',
    TargetAuraState: 'uint',
    ExcludeCasterAuraState: 'uint',
    ExcludeTargetAuraState: 'uint',
    CasterAuraSpell: 'uint',
    TargetAuraSpell: 'uint',
    ExcludeCasterAuraSpell: 'uint',
    ExcludeTargetAuraSpell: 'uint',
    CastingTimeIndex: 'uint',
    RecoveryTime: 'uint',
    CategoryRecoveryTime: 'uint',
    InterruptFlags: 'uint',
    AuraInterruptFlags: 'uint',
    ChannelInterruptFlags: 'uint',
    ProcTypeMask: 'uint',
    ProcChance: 'uint',
    ProcCharges: 'uint',
    MaxLevel: 'uint',
    BaseLevel: 'uint',
    SpellLevel: 'uint',
    DurationIndex: 'uint',
    PowerType: 'int',
    ManaCost: 'uint',
    ManaCostPerLevel: 'uint',
    ManaPerSecond: 'uint',
    ManaPerSecondPerLevel: 'uint',
    RangeIndex: 'uint',
    Speed: 'float',
    ModalNextSpell: 'uint',
    CumulativeAura: 'uint',
    Totem_1: 'uint',
    Totem_2: 'uint',
    Reagent_1: 'int',
    Reagent_2: 'int',
    Reagent_3: 'int',
    Reagent_4: 'int',
    Reagent_5: 'int',
    Reagent_6: 'int',
    Reagent_7: 'int',
    Reagent_8: 'int',
    ReagentCount_1: 'int',
    ReagentCount_2: 'int',
    ReagentCount_3: 'int',
    ReagentCount_4: 'int',
    ReagentCount_5: 'int',
    ReagentCount_6: 'int',
    ReagentCount_7: 'int',
    ReagentCount_8: 'int',
    EquippedItemClass: 'int',
    EquippedItemSubclass: 'int',
    EquippedItemInvTypes: 'int',
    Effect_1: 'uint',
    Effect_2: 'uint',
    Effect_3: 'uint',
    EffectDieSides_1: 'int',
    EffectDieSides_2: 'int',
    EffectDieSides_3: 'int',
    EffectRealPointsPerLevel_1: 'float',
    EffectRealPointsPerLevel_2: 'float',
    EffectRealPointsPerLevel_3: 'float',
    EffectBasePoints_1: 'int',
    EffectBasePoints_2: 'int',
    EffectBasePoints_3: 'int',
    EffectMechanic_1: 'uint',
    EffectMechanic_2: 'uint',
    EffectMechanic_3: 'uint',
    ImplicitTargetA_1: 'uint',
    ImplicitTargetA_2: 'uint',
    ImplicitTargetA_3: 'uint',
    ImplicitTargetB_1: 'uint',
    ImplicitTargetB_2: 'uint',
    ImplicitTargetB_3: 'uint',
    EffectRadiusIndex_1: 'uint',
    EffectRadiusIndex_2: 'uint',
    EffectRadiusIndex_3: 'uint',
    EffectAura_1: 'uint',
    EffectAura_2: 'uint',
    EffectAura_3: 'uint',
    EffectAuraPeriod_1: 'uint',
    EffectAuraPeriod_2: 'uint',
    EffectAuraPeriod_3: 'uint',
    EffectMultipleValue_1: 'float',
    EffectMultipleValue_2: 'float',
    EffectMultipleValue_3: 'float',
    EffectChainTargets_1: 'uint',
    EffectChainTargets_2: 'uint',
    EffectChainTargets_3: 'uint',
    EffectItemType_1: 'uint',
    EffectItemType_2: 'uint',
    EffectItemType_3: 'uint',
    EffectMiscValue_1: 'int',
    EffectMiscValue_2: 'int',
    EffectMiscValue_3: 'int',
    EffectMiscValueB_1: 'int',
    EffectMiscValueB_2: 'int',
    EffectMiscValueB_3: 'int',
    EffectTriggerSpell_1: 'uint',
    EffectTriggerSpell_2: 'uint',
    EffectTriggerSpell_3: 'uint',
    EffectPointsPerCombo_1: 'float',
    EffectPointsPerCombo_2: 'float',
    EffectPointsPerCombo_3: 'float',
    EffectSpellClassMaskA_1: 'uint',
    EffectSpellClassMaskA_2: 'uint',
    EffectSpellClassMaskA_3: 'uint',
    EffectSpellClassMaskB_1: 'uint',
    EffectSpellClassMaskB_2: 'uint',
    EffectSpellClassMaskB_3: 'uint',
    EffectSpellClassMaskC_1: 'uint',
    EffectSpellClassMaskC_2: 'uint',
    EffectSpellClassMaskC_3: 'uint',
    SpellVisualID_1: 'uint',
    SpellVisualID_2: 'uint',
    SpellIconID: 'uint',
    ActiveIconID: 'uint',
    SpellPriority: 'uint',
    Name_Lang_enUS: 'string',
    Name_Lang_enGB: 'string',
    Name_Lang_koKR: 'string',
    Name_Lang_frFR: 'string',
    Name_Lang_deDE: 'string',
    Name_Lang_enCN: 'string',
    Name_Lang_zhCN: 'string',
    Name_Lang_enTW: 'string',
    Name_Lang_zhTW: 'string',
    Name_Lang_esES: 'string',
    Name_Lang_esMX: 'string',
    Name_Lang_ruRU: 'string',
    Name_Lang_ptPT: 'string',
    Name_Lang_ptBR: 'string',
    Name_Lang_itIT: 'string',
    Name_Lang_Unk: 'string',
    Name_Lang_Mask: 'uint',
    NameSubtext_Lang_enUS: 'string',
    NameSubtext_Lang_enGB: 'string',
    NameSubtext_Lang_koKR: 'string',
    NameSubtext_Lang_frFR: 'string',
    NameSubtext_Lang_deDE: 'string',
    NameSubtext_Lang_enCN: 'string',
    NameSubtext_Lang_zhCN: 'string',
    NameSubtext_Lang_enTW: 'string',
    NameSubtext_Lang_zhTW: 'string',
    NameSubtext_Lang_esES: 'string',
    NameSubtext_Lang_esMX: 'string',
    NameSubtext_Lang_ruRU: 'string',
    NameSubtext_Lang_ptPT: 'string',
    NameSubtext_Lang_ptBR: 'string',
    NameSubtext_Lang_itIT: 'string',
    NameSubtext_Lang_Unk: 'string',
    NameSubtext_Lang_Mask: 'uint',
    Description_Lang_enUS: 'string',
    Description_Lang_enGB: 'string',
    Description_Lang_koKR: 'string',
    Description_Lang_frFR: 'string',
    Description_Lang_deDE: 'string',
    Description_Lang_enCN: 'string',
    Description_Lang_zhCN: 'string',
    Description_Lang_enTW: 'string',
    Description_Lang_zhTW: 'string',
    Description_Lang_esES: 'string',
    Description_Lang_esMX: 'string',
    Description_Lang_ruRU: 'string',
    Description_Lang_ptPT: 'string',
    Description_Lang_ptBR: 'string',
    Description_Lang_itIT: 'string',
    Description_Lang_Unk: 'string',
    Description_Lang_Mask: 'uint',
    AuraDescription_Lang_enUS: 'string',
    AuraDescription_Lang_enGB: 'string',
    AuraDescription_Lang_koKR: 'string',
    AuraDescription_Lang_frFR: 'string',
    AuraDescription_Lang_deDE: 'string',
    AuraDescription_Lang_enCN: 'string',
    AuraDescription_Lang_zhCN: 'string',
    AuraDescription_Lang_enTW: 'string',
    AuraDescription_Lang_zhTW: 'string',
    AuraDescription_Lang_esES: 'string',
    AuraDescription_Lang_esMX: 'string',
    AuraDescription_Lang_ruRU: 'string',
    AuraDescription_Lang_ptPT: 'string',
    AuraDescription_Lang_ptBR: 'string',
    AuraDescription_Lang_itIT: 'string',
    AuraDescription_Lang_Unk: 'string',
    AuraDescription_Lang_Mask: 'uint',
    ManaCostPct: 'uint',
    StartRecoveryCategory: 'uint',
    StartRecoveryTime: 'uint',
    MaxTargetLevel: 'uint',
    SpellClassSet: 'uint',
    SpellClassMask_1: 'uint',
    SpellClassMask_2: 'uint',
    SpellClassMask_3: 'uint',
    MaxTargets: 'uint',
    DefenseType: 'uint',
    PreventionType: 'uint',
    StanceBarOrder: 'uint',
    EffectChainAmplitude_1: 'float',
    EffectChainAmplitude_2: 'float',
    EffectChainAmplitude_3: 'float',
    MinFactionID: 'uint',
    MinReputation: 'uint',
    RequiredAuraVision: 'uint',
    RequiredTotemCategoryID_1: 'uint',
    RequiredTotemCategoryID_2: 'uint',
    RequiredAreasID: 'int',
    SchoolMask: 'uint',
    RuneCostID: 'uint',
    SpellMissileID: 'uint',
    PowerDisplayID: 'int',
    EffectBonusMultiplier_1: 'float',
    EffectBonusMultiplier_2: 'float',
    EffectBonusMultiplier_3: 'float',
    SpellDescriptionVariableID: 'uint',
    SpellDifficultyID: 'uint',
  },
  'Talent.dbc': {
    ID: 'int',
    TabID: 'int',
    TierID: 'int',
    ColumnIndex: 'int',
    SpellRank_1: 'int',
    SpellRank_2: 'int',
    SpellRank_3: 'int',
    SpellRank_4: 'int',
    SpellRank_5: 'int',
    SpellRank_6: 'int',
    SpellRank_7: 'int',
    SpellRank_8: 'int',
    SpellRank_9: 'int',
    PrereqTalent_1: 'int',
    PrereqTalent_2: 'int',
    PrereqTalent_3: 'int',
    PrereqRank_1: 'int',
    PrereqRank_2: 'int',
    PrereqRank_3: 'int',
    Flags: 'int',
    RequiredSpellID: 'int',
    CategoryMask_1: 'int',
    CategoryMask_2: 'int',
  },
  'MapDifficulty.dbc': {
    ID: 'int',
    MapID: 'int',
    Difficulty: 'int',
    Message_Lang_enUS: 'string',
    Message_Lang_enGB: 'string',
    Message_Lang_koKR: 'string',
    Message_Lang_frFR: 'string',
    Message_Lang_deDE: 'string',
    Message_Lang_enCN: 'string',
    Message_Lang_zhCN: 'string',
    Message_Lang_enTW: 'string',
    Message_Lang_zhTW: 'string',
    Message_Lang_esES: 'string',
    Message_Lang_esMX: 'string',
    Message_Lang_ruRU: 'string',
    Message_Lang_ptPT: 'string',
    Message_Lang_ptBR: 'string',
    Message_Lang_itIT: 'string',
    Message_Lang_Unk: 'string',
    Message_Lang_Mask: 'uint',
    RaidDuration: 'int',
    MaxPlayers: 'int',
    Difficultystring: 'string',
  },
} as const


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
    log({ error: 'unable to clear cache', message: (err as Error).message })
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
  const mux = new std.async.MuxAsyncIterator<Uint8Array>()
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

type DBCName = keyof typeof dbcSchemas
// type DBCValues = Parameters<typeof DBC.toBytes>[1]
// type Updates = { name: DBCName; data: DBCValues; replace?: boolean }[]
const openDBC = <T extends DBCName>(name: T) => {
  if (!config.wowDir) throw Error('need to locate your wow directory first')
  for (const patchName of patchFiles) {
    let mpq: MPQ | undefined
    try {
      mpq = MPQ.open(`${config.wowDir}\\Data\\enUS\\${patchName}`)
      const file = mpq.getFile(`DBFilesClient\\${name}`)
      const buffer = new ArrayBuffer(file.size)
      if (file.read(buffer) !== file.size) throw Error('invalid dbc file size')
      return DBC.fromBytes(dbcSchemas[name], buffer)
    } catch (err) {
      if ((err as any).type !== 'ERROR_FILE_NOT_FOUND') throw err
    } finally {
      mpq?.close()
    }
  }
  throw new Deno.errors.NotFound(`${name} not found`)
}

type Updates = { name: DBCName; data: Record<string, string| number | undefined>[]; replace?: boolean }[]
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
    log({ add: name })
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
      ? DBC.toBytes(dbcSchemas[name], data)
      : openDBC(name).assign(data).toBytes()
    await addDBC(name, dbc)
  }))

  mpq.close()
  return mpq.file
}

const sheetID = '11PVL9YA1lmCoqaIguKjwuDFX58e8hzAh6kzDXA4jBV4'
const getSheet = async (page: string) =>
  (await fetch(`https://opensheet.elk.sh/${sheetID}/${page}`)).json()

const cleanupSheetRow = row => Object.fromEntries(Object.entries(row).flatMap(([k, v]) =>  {
  const valueStr = v.trim()
  const valueNbr = Number(v)
  return valueStr ? [[k, Number.isNaN(valueNbr) ? valueStr : valueNbr]] : []
}))

const fetchUpdates = async (): Promise<Updates> => {
  const talentData = getSheet('TALENT.DBC')
  const spellsData = getSheet('SPELL.DBC')
  const spells = new Map()
  const addSpell = (spell: Record<string, unknown> & { ID: number }) => {
    const match = spells.get(spell.ID)
    match ? Object.assign(match, spell) : spells.set(spell.ID, spell)
  }

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

    addSpell({
      ID: Number(ID),
      Reagent_1, ReagentCount_1,
      Reagent_2, ReagentCount_2,
      Reagent_3, ReagentCount_3,
      Reagent_4, ReagentCount_4,
      ...(item && ({
        EffectItemType_1: item,
        Name_Lang_enUS: new_name,
      }))
    })

    const skill = bySpell[ID]
    if (skill) {
      skill.TrivialSkillLineRankHigh = skillReq + 15
      skill.TrivialSkillLineRankLow = skillReq + 7
    }
  }

  const gatheringAsSecondarySkills = [
    { ID: 182, CategoryID: 9 }, // Herbalism
    { ID: 186, CategoryID: 9 }, // Mining
    { ID: 393, CategoryID: 9 }, // Skinning
  ]

  for (const row of (await spellsData)) {
    if (!Number(row.ID)) continue
    addSpell(cleanupSheetRow(row))
  }

  const gnomerganHeroic = {
    ID: 18,
    Difficulty: 1,
    RaidDuration: 259200,
    Difficultystring: 'DUNGEON_DIFFICULTY_5PLAYER_HEROIC',
  }

  return [
    { name: 'SkillLine.dbc', data: gatheringAsSecondarySkills },
    { name: 'Spell.dbc', data: spells.values().toArray() },
    { name: 'SkillLineAbility.dbc', data: skills.rows },
    { name: 'MapDifficulty.dbc', data: [gnomerganHeroic] },
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
const R: Record<string, Handler> = {
  'GET/config': () =>
    new Response(JSON.stringify(config), {
      headers: { 'Content-Type': 'application/json' },
    }),
  'POST/config': async (req) => {
    assignConfig(await req.json())
    return OK
  },
  'GET/patch': async () => {
    log({ status: 'checking wow directory' })
    if (!config.wowDir) return new Response(null, { status: 400 })
    const updates = await fetchUpdates()
    log({ status: 'fetch updates' })
    const patchFile = await makePatch(updates)
    log({ status: 'build patch' })
    await Deno.copyFile(patchFile, `${config.wowDir}\\Data\\patch-X.mpq`)
    log({ status: 'write patch' })
    return OK
  },
  'GET/play': async () => {
    await startWoW()
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

const routes = Object.fromEntries(Object.entries(R).map(([path, handler]) => [
  path,
  async (req: Request, url: URL) => {
    const start = performance.now()
    try {
      const result = await handler(req, url)
      const duration = Math.round((performance.now() - start) * 1000) / 1000
      log({ action: url.pathname.slice(1), success: true, duration })
      return result
    } catch (err) {
      log({ action: url.pathname.slice(1), error: true, message: (err as Error)?.message })
    }
  }
]))

