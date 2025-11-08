import { PropsWithChildren, useEffect } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import authAtom, { IAuthState } from '../../auth.atom'
import userAtom from '@/pages/User/user.atom'
import http, { applyInterceptors } from '@/services/http'
import authApi from '../../auth.api'

const AuthGate = (props: PropsWithChildren) => {
  const [authState, setAuthState] = useRecoilState(authAtom)
  const setUserState = useSetRecoilState(userAtom)
  const location = useLocation()

  useEffect(() => {
    if (authState.authState === 'unknown') {
      const refreshToken = localStorage.getItem('refreshToken')
      authApi.refreshToken(refreshToken).then((r) => {
        if (r.status === 'error') {
          setAuthState((prev) => ({ ...prev, authState: 'not-authorized', accessToken: '', expires: 0 }))
        } else {
          const newAuthState: IAuthState = {
            authState: 'authorized' as const,
            accessToken: r.body.token,
            expires: Date.now() + 3600000,
          }

          setAuthState((prev) => ({
            ...prev,
            ...newAuthState,
          }))
          setUserState({ user: r.body.user })
          localStorage.setItem('accessToken', r.body.token)
          localStorage.setItem('refreshToken', r.body.refreshToken)
          applyInterceptors(newAuthState, setAuthState, r.body.refreshToken, http, 'default')
        }
      })
    }
  }, [])

  if (authState.authState === 'not-authorized') {
    return <Navigate to="/auth" replace={true} state={{ from: location }} />
  }
  console.log(authState.authState)
  return props.children
}

export default AuthGate
