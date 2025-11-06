import urls from '@/navigation/urls'

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
      <a href={href} className="text-nm text-link">
        {linkText}
      </a>
    </p>
  )
}

export default AuthRedirectLink
