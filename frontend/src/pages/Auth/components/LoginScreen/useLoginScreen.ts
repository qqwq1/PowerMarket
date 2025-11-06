import { useState } from 'react'
import useStateWithChange from '@/shared/hooks/useStateWithChange'
import authApi from '@/pages/Auth/auth.api'
import { useSetRecoilState } from 'recoil'
import authAtom from '@/pages/Auth/auth.atom'
import userAtom from '@/pages/User/user.atom'
import useHttpLoader from '@/shared/hooks/useHttpLoader'
import { useNavigate } from 'react-router-dom'
import urls from '@/navigation/urls'

const useLoginScreen = () => {
  const navigate = useNavigate()
  const [state, _, handleChange] = useStateWithChange({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const setAuthState = useSetRecoilState(authAtom)
  const setUserState = useSetRecoilState(userAtom)
  const [error, setError] = useState<string | null>(null)
  const { wait } = useHttpLoader()

  const isActionDisabled = loading || !state.email.trim() || !state.password.trim()

  const handleSubmit = async () => {
    if (isActionDisabled) return
    setLoading(true)
    setError(null)
    wait(authApi.login({ login: state.email.trim(), password: state.password }), (resp) => {
      if (resp.status === 'success') {
        localStorage.setItem('accessToken', resp.body.token)
        setAuthState((prev) => ({ ...prev, authState: 'authorized', accessToken: resp.body.token }))
        setUserState({ userRole: resp.body.user.role })
        navigate(urls.home)
      } else {
        setError(resp.message || 'Ошибка авторизации')
        setAuthState((prev) => ({ ...prev, authState: 'not-authorized' }))
      }
    })

    setLoading(false)
  }

  return {
    state,
    handleChange,
    handleSubmit,
    isActionDisabled,
    loading,
    error,
  }
}

export default useLoginScreen
