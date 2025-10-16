import { PropsWithChildren, useEffect } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import authAtom from '../../auth.atom'
import userAtom from '../../../User/user.atom'

const AuthGate = (props: PropsWithChildren) => {
  const [authState, setAuthState] = useRecoilState(authAtom)
  const setUserState = useSetRecoilState(userAtom)
  const location = useLocation()

  useEffect(() => {
    if (authState.authState === 'unknown') {
      const userRole = localStorage.getItem('userRole')

      setAuthState((prev) => ({ ...prev, authState: userRole ? 'authorized' : 'not-authorized' }))
      if (userRole === 'seller' || userRole === 'buyer') setUserState((prev) => ({ ...prev, userRole: userRole }))
    }
  }, [])

  if (authState.authState === 'not-authorized') {
    return <Navigate to="/auth" replace={true} state={{ from: location }} />
  }

  return props.children
}

export default AuthGate
