import StepIndicator from '@/shared/Common/StepIndicator'
import cn from '@/utils/cn'
import css from './authPage.module.css'
import Button from '@/shared/Buttons/Button'
import RegistrationRoleSelection from '../RegistrationRoleSelection'
import RegistrationForm from '../RegistrationForm'
import AuthRedirectLink from '../AuthRedirectLink'
import useRegisterScreen from './useRegisterScreen'

const RegisterScreen = () => {
  const ctrl = useRegisterScreen()

  const renderContent = () => {
    if (ctrl.stepIndex === 0) {
      return <RegistrationRoleSelection userRole={ctrl.userRole} setUserRole={ctrl.setUserRole} />
    }

    return <RegistrationForm state={ctrl.state} handleChange={ctrl.handleChange} />
  }
  return (
    <>
      <div style={{ width: '100%', maxWidth: '300px' }}>
        <StepIndicator stepNames={['', '']} activeStepIndex={ctrl.stepIndex} />
      </div>
      <div className={cn(css.roleSelectionBlock, 'flex-lines gap24 center')}>
        {renderContent()}
        <Button
          disabled={ctrl.isActionDisabled}
          onClick={() => (ctrl.stepIndex === 0 ? ctrl.goToNextStep() : ctrl.handleSubmit())}
          fullWidth
          size="default"
          type="primary"
          text={ctrl.stepIndex === 0 ? 'Продолжить' : 'Закончить'}
        />
        <AuthRedirectLink isRegisterRoute />
      </div>
    </>
  )
}

export default RegisterScreen
