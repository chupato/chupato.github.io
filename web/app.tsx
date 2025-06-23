import { Fragment, h, render } from 'preact'
import { Home } from 'lucide-preact'

Object.assign(globalThis, { h, Fragment })

function App() {
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


const root = document.getElementById('app')
if (!root) throw Error('unable to find root element #app')
render(<App />, root)
