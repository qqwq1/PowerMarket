import { PropsWithChildren, useEffect } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import authAtom from '../../auth.atom'
import userAtom from '@/pages/User/user.atom'

const AuthGate = (props: PropsWithChildren) => {
  const [authState, setAuthState] = useRecoilState(authAtom)
  const setUserState = useSetRecoilState(userAtom)
  const location = useLocation()

  useEffect(() => {
    if (authState.authState === 'unknown') {
      const user = JSON.parse(localStorage.getItem('user'))

      setAuthState((prev) => ({ ...prev, authState: user?.userRole ? 'authorized' : 'not-authorized' }))
      if (user?.userRole === 'seller' || user?.userRole === 'buyer')
        setUserState((prev) => ({ ...prev, userRole: user.userRole }))
    }
  }, [])

  if (authState.authState === 'not-authorized') {
    return <Navigate to="/auth" replace={true} state={{ from: location }} />
  }

  return props.children
}

export default AuthGate
