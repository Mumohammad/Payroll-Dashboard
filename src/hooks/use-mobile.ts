import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const mediaQuery = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

  const subscribe = React.useCallback((onStoreChange: () => void) => {
    const media = window.matchMedia(mediaQuery)
    media.addEventListener("change", onStoreChange)
    return () => media.removeEventListener("change", onStoreChange)
  }, [mediaQuery])

  const getSnapshot = React.useCallback(() => window.matchMedia(mediaQuery).matches, [mediaQuery])
  const getServerSnapshot = React.useCallback(() => false, [])

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
