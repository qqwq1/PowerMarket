import { useCallback } from 'react'

const useLogout = () => {
  return useCallback(() => {
    window.location.reload()
    localStorage.removeItem('user')
  }, [])
}

export default useLogout
