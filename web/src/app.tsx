import { useState } from 'preact/hooks'
import { Home } from 'lucide-preact'

export function App() {
  const [theme, setTheme] = useState('light')

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <div class="p-4">
      <button class="btn btn-primary mb-4" onClick={toggleTheme}>
        Toggle Theme ({theme})
      </button>
      <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">
            <Home size={24} class="inline-block mr-2" />
            Hello from Preact + DaisyUI!
          </h2>
          <p>If you see this card styled, DaisyUI is working.</p>
          <div class="card-actions justify-end">
            <button class="btn btn-secondary">Click me</button>
          </div>
        </div>
      </div>
    </div>
  )
}
