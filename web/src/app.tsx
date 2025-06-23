import { Home } from 'lucide-preact'

export function App() {
  return (
    <div class="p-4">
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
