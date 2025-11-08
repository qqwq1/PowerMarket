import Button from '@/shared/Buttons/Button'
import FormField from '@/shared/Forms/FormField'
import TextInput from '@/shared/Inputs/TextInput'
import cn from '@/utils/cn'
import css from './authPage.module.css'
import useLoginScreen from './useLoginScreen'
import AuthRedirectLink from '../AuthRedirectLink'

const LoginScreen = () => {
  const ctrl = useLoginScreen()

  return (
    <>
      <div className={cn(css.roleSelectionBlock, 'flex-lines gap24 center')}>
        <form className="flex-lines gap24 width100">
          <div className="flex-lines gap12">
            <FormField label="E-mail" style={{ width: '100%' }} required>
              <TextInput
                value={ctrl.state.email}
                name="email"
                type="email"
                onChange={ctrl.handleChange}
                placeHolder="E-mail"
              />
            </FormField>

            <FormField label="Пароль" style={{ width: '100%' }} required>
              <TextInput
                type="password"
                value={ctrl.state.password}
                name="password"
                onChange={ctrl.handleChange}
                placeHolder="Пароль"
              />
            </FormField>
          </div>
        </form>
        <Button
          disabled={ctrl.isActionDisabled}
          onClick={() => ctrl.handleSubmit()}
          fullWidth
          size="default"
          type="primary"
          text={'Войти'}
        />

        <AuthRedirectLink isRegisterRoute={false} />
      </div>
    </>
  )
}

export default LoginScreen
