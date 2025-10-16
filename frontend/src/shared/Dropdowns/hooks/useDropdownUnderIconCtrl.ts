import usePopup from '../../hooks/usePopup.ts'
import { useCallback, useRef } from 'react'

const useDropdownUnderIconCtrl = () => {
  const ref = useRef<HTMLDivElement>()
  const { open, setOpen } = usePopup(ref)

  const toggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  return { ref, open, setOpen, toggle }
}

export default useDropdownUnderIconCtrl
