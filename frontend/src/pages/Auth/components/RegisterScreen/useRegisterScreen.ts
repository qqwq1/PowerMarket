import urls from '@/navigation/urls'
import useStateWithChange from '@/shared/hooks/useStateWithChange'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TUserDto } from '../../../User/user.types'
import { useSetRecoilState } from 'recoil'
import userAtom from '../../../User/user.atom'
import authAtom, { IAuthState } from '../../auth.atom'
import authApi from '../../auth.api'
import useHttpLoader from '@/shared/hooks/useHttpLoader'
import http, { applyInterceptors } from '@/services/http'

const useRegisterScreen = () => {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState<0 | 1>(0)
  const [state, _, handleChange] = useStateWithChange({
    fullName: '',
    companyName: '',
    inn: '',
    phone: '',
    address: '',
    email: '',
    password: '',
  })
  const [userRole, setUserRole] = useState<'SUPPLIER' | 'TENANT'>(null)
  const { wait } = useHttpLoader()
  const setAuthState = useSetRecoilState(authAtom)
  const setUserState = useSetRecoilState(userAtom)

  // TODO вынести в utils

  // Валидация email
  const isValidEmail = /^\S+@\S+\.\S+$/.test(state.email.trim())
  // Валидация пароля (минимум 6 символов)
  const isValidPassword = state.password.trim().length >= 6
  // Валидация ФИО
  const isValidFullName = state.fullName.trim().length > 2
  // Валидация компании
  const isValidCompany = state.companyName.trim().length > 1
  // Валидация ИНН (10 или 12 цифр)
  const isValidInn = /^\d{10,12}$/.test(state.inn.trim())

  const isActionDisabled =
    stepIndex === 0 ? !userRole : !(isValidEmail && isValidPassword && isValidFullName && isValidCompany && isValidInn)

  const handleSubmit = async () => {
    if (!userRole) return

    const dto: TUserDto & { password: string } = {
      email: state.email.trim(),
      password: state.password.trim(),
      role: userRole,
      fullName: state.fullName.trim(),
      companyName: state.companyName,
      inn: state.inn,
      phone: state.phone,
      address: state.address,
    }

    wait(authApi.register(dto), (resp) => {
      if (resp.status === 'success') {
        const newAuthState: IAuthState = {
          authState: 'authorized' as const,
          accessToken: resp.body.token,
          expires: Date.now() + 3600000,
        }
        applyInterceptors(newAuthState, setAuthState, resp.body.refreshToken, http, 'default')
        localStorage.setItem('accessToken', resp.body.token)
        localStorage.setItem('refreshToken', resp.body.refreshToken)
        setAuthState((prev) => ({ ...prev, authState: 'authorized', accessToken: resp.body.token }))
        setUserState({ user: resp.body.user })
        navigate(urls.home)
      } else {
        const msg = resp.message || 'Не удалось завершить регистрацию'
        alert(msg)
      }
    })
  }

  return {
    stepIndex,
    handleChange,
    state,
    goToPrevStep: () => setStepIndex(0),
    goToNextStep: () => setStepIndex(1),
    setUserRole,
    userRole,
    isActionDisabled,
    handleSubmit,
  }
}

export default useRegisterScreen
