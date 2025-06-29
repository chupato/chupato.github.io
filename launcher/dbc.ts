const MAGIC_NUMBER = 1128416343 // 'WDBC'
const HEADER_SIZE = 20

type SchemaType = 'int' | 'uint' | 'byte' | 'float' | 'string'

// Record Structure
const view = (arrayBuffer: ArrayBuffer) => {
  const view = new DataView(arrayBuffer)
  let cursor = 0
  return {
    view,
    arrayBuffer,
    cursor: () => cursor,
    int(n: number) {
      view.setInt32(cursor, n, true)
      return (cursor += 4)
    },
    uint(n: number) {
      view.setUint32(cursor, n, true)
      return (cursor += 4)
    },
    byte(n: number) {
      view.setUint8(cursor, n)
      return (cursor += 1)
    },
    float(n: number) {
      view.setFloat32(cursor, n, true)
      return (cursor += 4)
    },
    string(n: number) {
      view.setInt32(cursor, n, true)
      return (cursor += 4)
    },
  }
}

export type Schema = { [k in string]: SchemaType }
type SchemaEntry = [keyof Schema, SchemaType]
export const toBytes = <T extends Schema>(
  schema: T,
  data: Partial<Record<keyof T, number | string>>[],
) => {
  const fields = Object.entries(schema) as SchemaEntry[]
  const rowCount = data.length
  const rowSize = fields.length * 4 // uint32 size
  const recordSize = rowSize * rowCount
  const dbc = view(new ArrayBuffer(HEADER_SIZE + recordSize))

  // Header
  dbc.uint(MAGIC_NUMBER) // 0 UInt32LE WDBC_MAGIC_WORD (1128416343)
  dbc.uint(rowCount) // 4 UInt32LE RECORDS
  dbc.uint(fields.length) // 8 UInt32LE FIELDS
  dbc.uint(rowSize) // 12 UInt32LE RECORD_SIZE
  dbc.uint(0) // 16 UInt32LE STRING_SIZE, place holder

  const encoder = new TextEncoder()
  const strings = []
  let stringOffset = 1
  for (const row of data) {
    for (const [key, type] of fields) {
      if (type === 'string') {
        const str = (row[key] as string)?.trim()
        if (str) {
          const strData = encoder.encode(str)
          strings.push(strData)
          dbc.uint(stringOffset)
          stringOffset += strData.byteLength + 1
        } else {
          dbc.uint(0)
        }
      } else {
        dbc[type](Number(row[key]) || 0)
      }
    }
  }
  const stringSize = strings.reduce((a, b) => a + b.byteLength + 1, 1)
  dbc.view.setUint32(16, stringSize, true)
  const combine = new Uint8Array(dbc.view.byteLength + stringSize)
  combine.set(new Uint8Array(dbc.arrayBuffer), 0)
  let cursor = dbc.view.byteLength + 1
  for (const str of strings) {
    combine.set(str, cursor)
    cursor += str.byteLength + 1
  }

  return combine
}

export const fromBytes = <T extends Schema>(
  schema: T,
  buffer: ArrayBuffer,
) => {
  type DBCRow = Partial<Record<keyof T, string | number>>
  const view = new DataView(buffer)
  const WORD = view.getUint32(0, true)
  const ROW_COUNT = view.getUint32(4, true)
  const FIELD_COUNT = view.getUint32(8, true)
  const RECORD_SIZE = view.getUint32(12, true)
  const STRING_SIZE = view.getUint32(16, true)
  if (WORD !== MAGIC_NUMBER) throw Error('invalid dbc signature')
  const fields = Object.entries(schema) as SchemaEntry[]
  const recordSize = fields.reduce(
    (acc, e) => acc + (e[1] === 'byte' ? 1 : 4),
    0,
  )

  if (
    FIELD_COUNT !== fields.length ||
    RECORD_SIZE !== recordSize
  ) {
    // console.log({ RECORD_SIZE, FIELD_COUNT, count: fields.length, size: FIELD_COUNT * 4 })
    throw Error(`invalid schema for ${name}`)
  }

  const decoder = new TextDecoder()
  const stringsStart = buffer.byteLength - STRING_SIZE
  const strings = decoder.decode(buffer.slice(stringsStart))
  const getStringAt = (start: number) => {
    let end = start - 1
    while (strings[++end] !== '\0') {}
    return strings.slice(start, end)
  }

  let rowIndex = -1
  const rows: DBCRow[] = []
  const byIds: Map<number, DBCRow> = new Map()
  while (++rowIndex < ROW_COUNT) {
    const row: DBCRow = {}
    let i = -1
    const rowStart = HEADER_SIZE + rowIndex * RECORD_SIZE
    let cursor = rowStart
    while (++i < FIELD_COUNT) {
      const field = fields[i]
      const key = field[0] as keyof DBCRow
      switch (field[1]) {
        case 'string': {
          const offset = view.getUint32(cursor, true)
          row[key] = getStringAt(offset)
          cursor += 4
          break
        }
        case 'byte': {
          row[key] = view.getInt8(cursor)
          cursor += 1
          break
        }
        case 'uint': {
          row[key] = view.getUint32(cursor, true)
          cursor += 4
          break
        }
        case 'int': {
          row[key] = view.getInt32(cursor, true)
          cursor += 4
          break
        }
        case 'float': {
          row[key] = view.getFloat32(cursor, true)
          cursor += 4
          break
        }
      }

      if (key === 'ID') {
        byIds.set(row[key] as number, row)
      }
    }
    rows.push(row)
  }

  return {
    assign(data: DBCRow[]) {
      for (const row of data) {
        const match = byIds.get(row.ID as number)
        if (match) {
          Object.assign(match, row)
        } else if (row.ID) {
          rows.push(row)
          byIds.set(Number(row.ID), row)
        }
      }
      return this
    },
    toBytes: () => toBytes(schema, rows),
    rows,
    byIds,
  }
}

/*
import { MPQ } from './mpq.ts'

const patchFiles = [
  'patch-enUS-3.MPQ',
  'patch-enUS-2.MPQ',
  'patch-enUS.MPQ',
  'locale-enUS.MPQ',
]

export const open = <T extends keyof Schemas>(
  wowDir: string,
  name: T,
  schema?: Schemas[T],
) => {
  if (!wowDir) throw Error('need to locate your wow directory first')
  for (const patchName of patchFiles) {
    try {
      using mpq = MPQ.open(`${wowDir}\\Data\\enUS\\${patchName}`)
      const file = mpq.getFile(`DBFilesClient\\${name}`)
      const buffer = new ArrayBuffer(file.size)
      if (file.read(buffer) !== file.size) throw Error('invalid dbc file size')
      return fromBytes(name, buffer, schema)
    } catch (err) {
      if ((err as any).type !== 'ERROR_FILE_NOT_FOUND') throw err
    }
  }
  throw new Deno.errors.NotFound(`${name} not found`)
}*/
