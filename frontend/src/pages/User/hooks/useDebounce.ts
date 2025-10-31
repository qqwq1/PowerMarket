import { useState } from 'react'
import useSkipFirstRenderEffect from './useSkipFirstRenderEffect'

const useDebounce = <T extends any>(value: T, delay = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useSkipFirstRenderEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value])

  return debouncedValue
}

export default useDebounce
