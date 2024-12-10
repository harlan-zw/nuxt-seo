import { appendHeader } from 'h3'
import { logger } from '~~/logger'

export function createPerformanceMeasure() {
  const e = useRequestEvent()
  const start = Date.now()
  return (id: string, _end?: number) => {
    const end = _end || Date.now()
    const duration = end - start
    if (import.meta.server) {
      appendHeader(e, 'Server-Timing', `${id};dur=${duration}`)
    }
    else if (import.meta.dev) {
      // lightmode
      logger.debug(`%c${id} %c${duration}ms`, 'color: #ff00ff', 'color: #ff00ff; font-weight: bold')
    }
  }
}
