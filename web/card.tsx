import type { ComponentChildren } from 'preact'

export const Card = ({ children }: { children?: ComponentChildren }) => (
  <div class='card card-compact bg-base-100 shadow border-3 border-base-200/20'>
    <div class='card-body p-2 space-y-1'>
      {children}
    </div>
  </div>
)

Card.Title = ({ children }: { children?: ComponentChildren }) => (
  <h2 class='card-title opacity-70 text-neutral-400 flex items-center drop-shadow'>
    {children}
  </h2>
)
