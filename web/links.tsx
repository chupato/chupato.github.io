import { CloudDownload, Link, MessageCircle } from 'lucide-preact'
import { Card } from './card.tsx'

export const Links = () => (
  <Card>
    <Card.Title>
      <Link size={20} /> Links
    </Card.Title>
    <a
      href='https://discord.gg/uHGR3rB'
      target='_blank'
      class='btn btn-outline opacity-80 hover:opacity-100 btn-secondary w-full gap-2'
    >
      <MessageCircle size={16} /> Join Discord
    </a>
    <a
      href='https://github.com/chupato/chupato.github.io/releases/latest/download/chupato.exe'
      download='chupato.exe'
      class='hidden sm:flex btn btn-primary w-full justify-center gap-2 font-bold'
    >
      <CloudDownload size={16} /> Download Launcher
    </a>
  </Card>
)
