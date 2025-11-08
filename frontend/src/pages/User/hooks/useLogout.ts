import { useCallback } from 'react'
import { useSetRecoilState } from 'recoil'
import authAtom from '@/pages/Auth/auth.atom'

const useLogout = () => {
  const setAuthState = useSetRecoilState(authAtom)
  return useCallback(() => {
    setAuthState((prev) => ({ ...prev, authState: 'not-authorized' }))
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.reload()
  }, [])
}

export default useLogout
