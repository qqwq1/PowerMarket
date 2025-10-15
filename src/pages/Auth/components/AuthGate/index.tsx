import { PropsWithChildren, useEffect } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import authAtom from '../../auth.atom'

const AuthGate = (props: PropsWithChildren) => {
  const authState = useRecoilValue(authAtom)

  const location = useLocation()

  useEffect(() => {
    if (authState.authState !== 'authorized') return
  }, [authState])

  if (authState.authState === 'not-authorized') {
    return <Navigate to="/auth" replace={true} state={{ from: location }} />
  }

  return props.children
}

export default AuthGate
