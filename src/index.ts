import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Screens = Record<string, string>
export interface UseDataScrollOptions {
  autoStart?: boolean
  screens?: Screens
  selector?: string
  getSpeed?: (target: HTMLElement) => string | undefined
  getFrom?: (target: HTMLElement) => gsap.TweenVars | undefined
  getTo?: (target: HTMLElement) => gsap.TweenVars | undefined
  getUseMarkers?: (target: HTMLElement) => boolean
}

export type ApplyOptions = Pick<
  UseDataScrollOptions,
  'getSpeed' | 'getFrom' | 'getTo' | 'getUseMarkers' | 'screens'
>

gsap.registerPlugin(ScrollTrigger)

const defaultScreen: Screens = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

let matchMedia: gsap.MatchMedia

function getVariables(element: HTMLElement, dataKey: string) {
  const data = element.dataset[dataKey]
  if (!data) return
  return JSON.parse(data) as gsap.TweenVars
}

function getMediaQuery(
  screen: string | undefined,
  type: 'min' | 'max',
  screens?: Screens,
) {
  if (!screens) screens = defaultScreen
  if (!screen) {
    if (type === 'min') return '(min-width: 0px)'
    if (type === 'max') throw new Error('Only min is supported without screen.')
    return undefined as never
  }

  if (screen && !screens[screen]) {
    throw new Error(
      `Breakpoint "${screen}" not found in screens (${Object.keys(screens).join(
        ', ',
      )}).`,
    )
  }

  return type === 'min'
    ? `(min-width: ${screens[screen]})`
    : `(max-width: ${Number.parseInt(screens[screen]) - 1}px)`
}

function warn(message: string) {
  console.warn(`[data-scroll] ${message}`)
}

function handleError(error: unknown) {
  if (error instanceof Error) {
    warn(error.message)
  } else if (typeof error === 'string') {
    warn(error)
  }
}

function apply(target: HTMLElement, options?: ApplyOptions) {
  const {
    getSpeed = () => target.dataset.scrollSpeed,
    getFrom = () => getVariables(target, 'scrollFrom'),
    getTo = () => getVariables(target, 'scrollTo'),
    getUseMarkers = () => Object.hasOwn(target.dataset, 'scrollMarkers'),
  } = options || {}

  const dataSpeed = getSpeed(target) ?? '1'
  const dataFrom = getFrom(target)
  const dataTo = getTo(target)
  const markers = getUseMarkers(target)

  const values = dataSpeed.split(' ')

  for (const [index, value] of values.entries()) {
    const conditions: string[] = []

    const screen = value.includes(':') ? value.split(':')[0] : undefined
    try {
      const mediaQuery = getMediaQuery(screen, 'min', options?.screens)
      conditions.push(mediaQuery)
    } catch (error) {
      handleError(error)
      continue
    }

    const nextValue = index < values.length - 1 ? values[index + 1] : undefined
    if (nextValue) {
      const nextScreen = nextValue.includes(':')
        ? nextValue.split(':')[0]
        : undefined
      if (!nextScreen) {
        warn(
          `Only the first value can omit the screen (${nextScreen} in "${dataSpeed}").`,
        )
        continue
      }

      try {
        const mediaQuery = getMediaQuery(nextScreen, 'max', options?.screens)
        conditions.push(mediaQuery)
      } catch (error) {
        handleError(error)
        continue
      }
    }

    matchMedia.add(conditions.join(' and '), () => {
      const rawSpeed = value.includes(':') ? value.split(':')[1] : value
      const clamp = rawSpeed.startsWith('clamp(')
      const speed = Number.parseFloat(clamp ? rawSpeed.slice(6, -1) : rawSpeed)

      if (Number.isNaN(speed)) return
      if (speed === 1 && !dataFrom && !dataTo) return // Nothing to animate
      if (speed <= 0) {
        warn(`Speed must be greater than 0 (${speed} in "${dataSpeed}").`)
        return
      }

      let endOffset = 0
      let startOffset = 0

      const updateOffsets = (scrollTrigger: ScrollTrigger) => {
        const viewportHeight = window.innerHeight
        const targetHeight = target.offsetHeight

        if (clamp) {
          target.style.transform = ''
          const positionInViewport = ScrollTrigger.positionInViewport(
            target,
            'top',
          )
          const fromViewportTop = viewportHeight * positionInViewport
          const fromPageTop = fromViewportTop + scrollTrigger.scroll()
          if (fromPageTop < viewportHeight) {
            endOffset = (fromViewportTop + targetHeight) * (1 / speed - 1)
            startOffset = 0
            return
          }
        }

        endOffset = (viewportHeight / 2 + targetHeight / 2) * (1 / speed - 1)
        startOffset = endOffset * -1
      }

      gsap.fromTo(
        target,
        { ...dataFrom, y: () => startOffset },
        {
          ...dataTo,
          y: () => endOffset,
          ease: 'none',
          scrollTrigger: {
            id: speed.toString(),
            trigger: target,
            start: () => {
              if (startOffset === 0) return '0'
              return `top+=${startOffset}px bottom`
            },
            end: () => `bottom+=${endOffset}px top`,
            scrub: true,
            invalidateOnRefresh: true,
            refreshPriority: -999,
            markers,
            onRefreshInit: (self) => {
              updateOffsets(self)
            },
            onEnter: () => {
              gsap.set(target, { y: startOffset })
              if (speed > 1) {
                gsap.set(target, { visibility: 'initial' })
              }
            },
            onLeave: () => {
              gsap.set(target, { y: endOffset })
            },
            onLeaveBack: () => {
              gsap.set(target, { y: startOffset })
            },
            onEnterBack: () => {
              gsap.set(target, { y: endOffset })
            },
            onToggle: ({ isActive }) => {
              gsap.set(target, {
                willChange: isActive ? 'transform' : 'auto',
              })
            },
          },
        },
      )

      // Prevent the element from being visible before the animation starts
      if (speed > 1 && startOffset !== 0) {
        gsap.set(target, {
          visibility: 'hidden',
        })
      }
    })
  }
}

export function useDataScroll(options?: UseDataScrollOptions) {
  const autoStart = options?.autoStart ?? true
  const selector =
    options?.selector ??
    '[data-scroll-speed],[data-scroll-from],[data-scroll-to]'

  matchMedia = gsap.matchMedia()

  if (autoStart) {
    const targets = document.querySelectorAll<HTMLElement>(selector)
    for (const target of targets) {
      apply(target, options)
    }
  }

  return {
    apply: (target: HTMLElement) => apply(target, options),
    destroy: () => matchMedia.revert(),
  }
}
