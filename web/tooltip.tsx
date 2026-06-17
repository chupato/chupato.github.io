import { h } from 'preact'
import { computed, Signal } from '@preact/signals'
import { url } from './router.tsx'

type AddEventListenerParams = Parameters<typeof addEventListener>
type EventType = keyof WindowEventMap
type EventOpts = AddEventListenerParams[2]
export const domEvent = <EventName extends EventType>(
  eventName: EventName,
  opts?: EventOpts,
) => {
  type EventData = WindowEventMap[EventName] | null
  const event = new Signal<EventData>(null)
  const setEvent = (ev: EventData) => event.value = ev
  addEventListener(eventName, setEvent, opts || false)
  return Object.assign(event, {
    [Symbol.dispose]() {
      removeEventListener(eventName, setEvent, opts || false)
    },
  })
}

const resizeEvent = domEvent('resize')
const windowSize = computed(() => {
  resizeEvent.value // We don't need the event, just to retrigger
  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  }
})

type Quality =
  | 'POOR'
  | 'COMMON'
  | 'UNCOMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY'
  | 'ARTIFACT'
  | 'HEIRLOOM'

type TipData = {
  quality?: Quality
  title: string
  icon: string
  description: string
}

const tipCache = new Signal(0)
const tipsData = new WeakMap<Element, TipData>()
export const setTipData =
  (data: TipData) => (elem: EventTarget | HTMLElement | null) => {
    if (!(elem instanceof HTMLElement)) return
    const prev = tipsData.get(elem)
    if (
      prev?.quality === data.quality &&
      prev?.title === data.title &&
      prev?.icon === data.icon &&
      prev?.description === data.description
    ) return
    tipsData.set(elem, data)
    tipCache.value++
  }

const ToolTipContent = () => {
  const data = tipData.value
  if (!data) return null
  const { icon, quality, title, description } = data
  const qualityClass = quality || 'text-white'
  const borderClass = quality ? 'border-current' : 'border-black'
  return (
    <>
      {icon && (
        <div
          class={`size-12 rounded border ${borderClass} bg-cover bg-center ${qualityClass}`}
          style={{ backgroundImage: `url(/assets/icon/${icon}.jpg)` }}
        />
      )}
      <div
        class={`${qualityClass} min-w-0 flex-1 rounded border ${borderClass} bg-black/75 p-1 backdrop-blur`}
      >
        <div class='font-bold'>
          {title}
        </div>
        <div class='text-green-400'>{description}</div>
      </div>
    </>
  )
}

const toolTipElem = new Signal<HTMLElement | null>(null)
const setToolTipElem = (elem: HTMLElement | null) => {
  if (toolTipElem.value !== elem) toolTipElem.value = elem
}
const mouse = domEvent('mousemove')
const tipData = computed(() => {
  tipCache.value
  url.params.talent
  const match = mouse.value?.target instanceof HTMLElement
    ? mouse.value.target.closest('[data-tip]')
    : undefined
  return match && tipsData.get(match)
})

const M = 8
const W = 456

export const ToolTip = () => {
  const { x = 0, y = 0 } = mouse.value || {}
  const { innerWidth, innerHeight } = windowSize.value
  const tipStyle: h.JSX.CSSProperties = {}
  const width = Math.min(W, innerWidth - M * 2)
  let X = x + M
  let Y = y - 52
  tipStyle.width = `${width}px`
  tipStyle.maxHeight = `${innerHeight - M * 2}px`
  if (X + width + M > innerWidth) {
    X = x - width - M
    tipStyle.flexDirection = 'row-reverse'
  }
  X = Math.max(M, Math.min(X, innerWidth - width - M))
  Y = Math.max(
    M,
    Math.min(
      Y,
      innerHeight -
        Math.min(
          toolTipElem.value?.getBoundingClientRect().height || 0,
          innerHeight - M * 2,
        ) -
        M,
    ),
  )
  tipStyle.transform = `translate3d(${Math.round(X)}px, ${Math.round(Y)}px, 0)`

  return (
    <div
      class='
        flex gap-1
        fixed pointer-events-none z-50
        top-0 left-0
        opacity-100 transition-opacity duration-200
      '
      style={tipStyle}
      ref={setToolTipElem}
    >
      <ToolTipContent />
    </div>
  )
}
