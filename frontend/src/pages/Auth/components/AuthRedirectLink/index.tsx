import urls from '@/navigation/urls'
import { Link } from 'react-router-dom'

interface IProps {
  isRegisterRoute: boolean
}

const AuthRedirectLink = (props: IProps) => {
  const href = props.isRegisterRoute ? urls.auth : urls.register
  const linkText = props.isRegisterRoute ? 'Войти' : 'Зарегистрироваться'
  const text = props.isRegisterRoute ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '

  return (
    <p>
      <span className="text-nm">{text}</span>
      <Link to={href} className="text-nm text-link">
        {linkText}
      </Link>
    </p>
  )
}

export default AuthRedirectLink
