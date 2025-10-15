import urls from '@/navigation/urls'
import useStateWithChange from '@/shared/hooks/useStateWithChange'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TUserRole } from '../User/user.types'
import { useSetRecoilState } from 'recoil'
import userAtom from '../User/user.atom'
import authAtom from './auth.atom'

const navigate = useNavigate()
const useAuthScreen = () => {
  const [stepIndex, setStepIndex] = useState<0 | 1>(0)
  const [state, _, handleChange] = useStateWithChange({ email: '' })
  const [userRole, setUserRole] = useState<TUserRole>()

  const setAuthValue = useSetRecoilState(authAtom)
  const setUserState = useSetRecoilState(userAtom)

  const handleSubmit = () => {
    localStorage.setItem('userRole', userRole)
    localStorage.setItem('email', state.email)

    setAuthValue({ authState: 'authorized' })
    setUserState({ userRole })

    navigate(urls.home)
  }

  return {
    stepIndex,
    handleChange,
    state,
    goToPrevStep: () => setStepIndex(0),
    goToNextStep: () => setStepIndex(1),
    setUserRole,
    userRole,
    handleSubmit,
  }
}

export default useAuthScreen
