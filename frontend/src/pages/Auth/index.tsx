import css from './authPage.module.css'
import { useLocation } from 'react-router-dom'
import LoginScreen from './components/LoginScreen'
import RegisterScreen from './components/RegisterScreen'

const Auth = () => {
  const location = useLocation()
  const isRegisterRoute = location.pathname === '/register'

  return (
    <div className={css.wrapper}>
      <div className="flex-lines gap24 center">
        <div className="flex-lines gap12 center">
          <p className="text-heading-2 text-primary">PowerMarket</p>
          <p className="text-heading-3">{isRegisterRoute ? 'Регистрация' : 'Вход'}</p>
        </div>
      </div>
      {isRegisterRoute ? <RegisterScreen /> : <LoginScreen />}
    </div>
  )
}

export default Auth
