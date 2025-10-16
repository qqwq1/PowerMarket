import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { AnyObject } from '@/global.types'

export type ChangeCallback<T extends AnyObject, K extends keyof T> = (val: T[K], key: K) => void

const useStateWithChange = <T extends AnyObject>(
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, ChangeCallback<T, keyof T>] => {
  const [state, setState] = useState<T>(initialValue)

  const handleChange: ChangeCallback<T, keyof T> = useCallback((val, key) => {
    setState((prev) => ({ ...prev, [key]: val }))
  }, [])

  return [state, setState, handleChange]
}

export default useStateWithChange
