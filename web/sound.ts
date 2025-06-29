const chupatoSoundUrl =
  'https://rawcdn.githack.com/chupato/chupato.github.io/d4b928bd955c26ca2ec10c7c6c90d188ca474563/launcher/chupato-cute.ogg'

const audioContext = new AudioContext()
const audioBuffer = fetch(chupatoSoundUrl)
  .then((response) => response.arrayBuffer())
  .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))

const _timings = [
  0, // Challenge
  0.92, // Heroes
  1.62, // Ultimate
  2.432, // Private
  2.95, // Adventure
  3.65, // Twink
  4.15, // Online
  4.7, // Chupato
] as const

let source: AudioBufferSourceNode | undefined

const play = async (offset?: number, duration?: number) => {
  source = audioContext.createBufferSource()
  source.buffer = await audioBuffer
  source.connect(audioContext.destination)
  source.start(0, offset, duration)
}

export const toggleSound = () => {
  if (source) {
    source.stop()
    source = undefined
  } else {
    play()
  }
}
