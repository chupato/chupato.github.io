import type { JSX } from 'preact'

export const Card = (
  { class: className, ...props }: JSX.HTMLAttributes<HTMLDivElement>,
) => (
  <div
    class={`card card-compact bg-base-100 shadow border-3 border-base-200/20 ${
      className || ''
    }`}
  >
    <div class='card-body p-2 space-y-1' {...props} />
  </div>
)

Card.Title = (
  { class: className, ...props }: JSX.HTMLAttributes<HTMLHeadingElement>,
) => (
  <h2
    class={`card-title opacity-70 text-neutral-400 flex items-center drop-shadow ${
      className || ''
    }`}
    {...props}
  />
)
