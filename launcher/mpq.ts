import { getDll } from './dll.ts'
import { ExitCodes } from './win-exit-codes.ts'

const encoder = new TextEncoder()
const c_str = (str: string) => encoder.encode(str + '\0')
const utf16 = (str: string) => {
  const buff = new Uint16Array(str.length + 1)
  let i = -1
  while (++i < str.length) {
    buff[i] = str[i].charCodeAt(0)
  }
  return buff
}

enum Compression {
  // Use Huffman compression.
  // This bit can only be combined with MPQ_COMPRESSION_ADPCM_MONO or MPQ_COMPRESSION_ADPCM_STEREO.
  HUFFMANN = 0x01,

  // Use ZLIB compression library.
  // This bit cannot be combined with BZIP2 or LZMA.
  ZLIB = 0x02,

  // Use Pkware Data Compression Library.
  // This bit cannot be combined with LZMA.
  PKWARE = 0x08,

  // Use BZIP2 compression library.
  // This bit cannot be combined with ZLIB or LZMA.
  BZIP2 = 0x10,

  // Use SPARSE compression.
  // This bit cannot be combined with LZMA.
  SPARSE = 0x20,

  // Use IMA ADPCM compression for 1-channel (mono) WAVE files.
  // This bit can only be combined with HUFFMANN.
  // This is lossy compression and should only be used for compressing WAVE files.
  ADPCM_MONO = 0x40,

  // Use IMA ADPCM compression for 2-channel (stereo) WAVE files.
  // This bit can only be combined with HUFFMANN.
  // This is lossy compression and should only be used for compressing WAVE files.
  ADPCM_STEREO = 0x80,

  // Use LZMA compression.
  // This value can not be combined with any other compression method.
  LZMA = 0x12,
}

enum ArchiveFlags {
  // The file will be compressed using IMPLODE compression method.
  // This flag cannot be used together with COMPRESS.
  // If this flag is present, then the dwCompression and dwCompressionNext parameters are ignored.
  // This flag is obsolete and was used only in Diablo I.
  IMPLODE = 0x00000100,

  // The file will be compressed.
  // This flag cannot be used together with IMPLODE.
  COMPRESS = 0x00000200,

  // The file will be stored as encrypted.
  ENCRYPTED = 0x00010000,

  // The file's encryption key will be adjusted according to file size in the archive.
  // This flag must be used together with ENCRYPTED.
  FIX_KEY = 0x00020000,

  // The file will have the deletion marker.
  DELETE_MARKER = 0x02000000,

  // The file will have CRC for each file sector.
  // Ignored if the file is not compressed or if the file is stored as single unit.
  SECTOR_CRC = 0x04000000,

  // The file will be added as single unit.
  // Files stored as single unit cannot be encrypted,
  // because Blizzard doesn't support them.
  SINGLE_UNIT = 0x01000000,

  // If this flag is specified and the file is already in the MPQ,
  // it will be replaced.
  REPLACEEXISTING = 0x80000000,
}

enum CreateFlags {
  // The newly created archive will have (listfile) present.
  // Note that all archives created by SFileCreateArchive have listfile present due to compatibility reasons.
  LISTFILE = 0x00100000,

  // The newly created archive will have additional attributes in (attributes) file.
  ATTRIBUTES = 0x00200000,

  // The newly created archive will be signed with weak digital signature (the "(signature) file).
  SIGNATURE = 0x00400000,

  // The function creates a MPQ version 1.0 (up to 4 GB).
  // This is the default value
  ARCHIVE_V1 = 0x00000000,

  // The function creates a MPQ version 2.0 (supports MPQ of size greater than 4 GB).
  ARCHIVE_V2 = 0x01000000,

  // The function creates a MPQ version 3.0 (introduced in WoW-Cataclysm Beta).
  ARCHIVE_V3 = 0x02000000,

  // The function creates a MPQ version 4.0 (used in WoW-Cataclysm)
  ARCHIVE_V4 = 0x03000000,
}

const errorMessages = {
  10000: `Not a MPQ file, but an AVI file`,
  10001: `Cannot find file key`,
  10002: `Sector CRC doesn\'t match`,
  10003: `The given operation is not allowed on internal file`,
  10004:
    `The file is present as incremental patch file, but base file is missing`,
  10005: `The file was marked as "deleted" in the MPQ`,
  10006: `The required file part is missing`,
  10007: `A name of at least one file is unknown`,
  10008: `Unable to find patch prefix for the patches`,
  10009: `The header at this position is fake header`,
  10010: `The file is present but contains delete marker`,
} as const

const GetLastError: Deno.ForeignFunction = { result: 'u32', parameters: [] }
class LastError extends Error {
  type: string
  code: number
  constructor() {
    const code = symbols.GetLastError() as keyof typeof errorMessages
    const type = ExitCodes[code] || 'ERROR_UNEXPECTED'
    const message = errorMessages[code] || `(${code})`
    super(`${type}: ${message}`)
    this.type = type
    this.code = code
  }
}

// bool WINAPI SFileCreateArchive(
const SFileCreateArchive: Deno.ForeignFunction = {
  result: 'bool',
  parameters: [
    'buffer', // const TCHAR * szMpqName - Archive file name
    'u32', // DWORD dwCreateFlags - Additional flags to specify creation details
    'u32', // DWORD dwMaxFileCount - Limit for file count
    'pointer', // HANDLE * phMPQ - Pointer to result HANDLE
  ],
} as const

// bool WINAPI SFileAddFileEx(
const SFileAddFileEx: Deno.ForeignFunction = {
  result: 'bool',
  parameters: [
    'pointer', // HANDLE hMpq - Handle to the MPQ
    'buffer', // const char * szFileName - The name of a file to be removed
    'buffer', // const char * szArchivedName - The name under which the file will be stored
    'u32', // DWORD dwFlags - Specifies archive flags for the file
    'u32', // DWORD dwCompression - Compression for the first block of the file
    'u32', // DWORD dwCompressionNext - Compression for rest of the file (except the first block)
  ],
} as const

// bool WINAPI SFileOpenArchive(
const SFileOpenArchive: Deno.ForeignFunction = {
  result: 'bool',
  parameters: [
    'buffer', // const char * szMpqName - Archive file name
    'u32', // DWORD dwPriority - Archive priority
    'u32', // DWORD dwFlags - Open flags
    'pointer', // HANDLE * phMPQ - Pointer to result HANDLE
  ],
}

// bool WINAPI SFileCloseArchive(
const SFileCloseArchive: Deno.ForeignFunction = {
  result: 'bool',
  parameters: ['pointer'], // HANDLE hMpq - Handle to an open MPQ
} as const

// DWORD WINAPI SFileGetFileSize(
const SFileGetFileSize: Deno.ForeignFunction = {
  result: 'u32',
  parameters: [
    'pointer', // HANDLE hFile - File handle
    'pointer', // DWORD * pdwFileSizeHigh - High 32 bits of the file size.
  ],
}

// bool WINAPI SFileOpenFileEx(
const SFileOpenFileEx: Deno.ForeignFunction = {
  result: 'bool',
  parameters: [
    'pointer', // HANDLE hMpq - Archive handle
    'buffer', // const char * szFileName - Name of the file to open
    'u32', // DWORD dwSearchScope - Specifies the scope for the file.
    'pointer', // HANDLE * phFile - Pointer to file handle
  ],
}

// bool WINAPI SFileReadFile(
const SFileReadFile: Deno.ForeignFunction = {
  result: 'bool',
  parameters: [
    'pointer', // HANDLE hFile - File handle
    'buffer', // VOID * lpBuffer - Pointer to buffer where to read the data
    'u32', // DWORD dwToRead - Number of bytes to read
    'pointer', // DWORD * pdwRead - Pointer to variable that receivs number of bytes read
    'pointer', // LPOVERLAPPED lpOverlapped - Pointer to OVERLAPPED structure
  ],
}

// bool WINAPI SFileCloseFile(
const SFileCloseFile: Deno.ForeignFunction = {
  result: 'bool',
  parameters: ['pointer'], // HANDLE hFile - Handle to an open MPQ
}

const { symbols } = Deno.dlopen((await getDll()).StormLib, {
  SFileCreateArchive,
  SFileCloseArchive,
  SFileOpenArchive,
  SFileAddFileEx,
  SFileGetFileSize,
  SFileOpenFileEx,
  SFileReadFile,
  SFileCloseFile,
  GetLastError,
})

const BASE_PROVIDER_FILE = 0x0000
const STREAM_FLAG_READ_ONLY = 0x00000100
const STREAM_FLAG_WRITE_SHARE = 0x00000200
export class File {
  size: number
  pointer: Deno.PointerValue<unknown>
  mpq: MPQ
  name: string
  #closed: boolean
  constructor(mpq: MPQ, name: string) {
    const file = Deno.UnsafePointer.of(new Uint32Array(1))
    if (!file) throw Error('unable to get file pointer')
    this.mpq = mpq
    this.name = name
    this.#closed = false
    const ok = symbols.SFileOpenFileEx(
      mpq.pointer,
      c_str(name),
      0, // SFILE_OPEN_FROM_MPQ
      file,
    )
    if (!ok) throw new LastError()
    this.pointer = new Deno.UnsafePointerView(file).getPointer(0)
    this.size = symbols.SFileGetFileSize(this.pointer, null) as number
    if (this.size === 0xFFFFFFFF) throw new LastError()
  }

  read(buffer: ArrayBuffer) {
    const sizeBuff = new Uint32Array(1)
    symbols.SFileReadFile(
      this.pointer,
      buffer,
      buffer.byteLength,
      Deno.UnsafePointer.of(sizeBuff),
      null,
    )
    return sizeBuff[0]
  }

  [Symbol.dispose]() {
    this.close()
  }

  close() {
    if (this.#closed) return
    const ok = symbols.SFileCloseFile(this.pointer)
    if (!ok) throw new LastError()
    this.#closed = true
  }
}

export class MPQ {
  pointer: Deno.PointerValue<unknown>
  value: Deno.PointerObject<unknown>
  file: string
  #closed: boolean

  static create(file: string) {
    const mpq = Deno.UnsafePointer.of(new Uint8Array(8))
    if (!mpq) throw Error('Unable to get UnsafePointer')
    const ok = symbols.SFileCreateArchive(
      utf16(file),
      CreateFlags.ARCHIVE_V2 |
        CreateFlags.LISTFILE |
        CreateFlags.ATTRIBUTES |
        CreateFlags.SIGNATURE,
      127, // Max files in archive
      mpq,
    )
    if (!ok) throw new LastError()
    return new MPQ(mpq, file)
  }

  static open(file: string, { readonly = true } = {}) {
    const mpq = Deno.UnsafePointer.of(new Uint8Array(8))
    if (!mpq) throw Error('Unable to get UnsafePointer')
    const ok = symbols.SFileOpenArchive(
      utf16(file),
      0, // dwPriority, unused - always 0
      BASE_PROVIDER_FILE |
        (readonly ? STREAM_FLAG_READ_ONLY : STREAM_FLAG_WRITE_SHARE),
      mpq,
    )
    if (!ok) throw new LastError()
    return new MPQ(mpq, file)
  }

  constructor(mpq: Deno.PointerObject<unknown>, file: string) {
    this.file = file
    this.value = mpq
    this.pointer = new Deno.UnsafePointerView(mpq).getPointer(0)
    this.#closed = false
  }

  getFile(archiveName: string) {
    return new File(this, archiveName)
  }

  addFile(fileName: string, archiveName: string) {
    const ok = symbols.SFileAddFileEx(
      this.pointer,
      utf16(fileName),
      c_str(archiveName),
      ArchiveFlags.COMPRESS,
      Compression.ZLIB,
      Compression.ZLIB,
    )
    if (!ok) throw new LastError()
  }

  close() {
    if (this.#closed) return
    const ok = symbols.SFileCloseArchive(this.pointer)
    if (!ok) throw new LastError()
    this.#closed = true
  }

  [Symbol.dispose]() {
    this.close()
  }
}
