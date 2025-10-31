import { DependencyList, EffectCallback, useEffect, useRef } from 'react'

const useSkipFirstRenderEffect = (effect: EffectCallback, deps?: DependencyList) => {
  const renderCount = useRef(0)

  useEffect(() => {
    if (renderCount.current === 0) {
      renderCount.current++
      return
    }

    if (renderCount.current === 1 && import.meta.env.MODE === 'development') {
      renderCount.current++
      return
    }

    return effect()
  }, deps)
}

export default useSkipFirstRenderEffect
