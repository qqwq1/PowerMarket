import Button from '@/shared/Buttons/Button'
import css from './authPage.module.css'
import useAuthScreen from './useAuthScreen'
import StepIndicator from '@/shared/Common/StepIndicator'
import cn from '@/utils/cn'
import AuthRoleSelection from './components/AuthRoleSelection'
import AuthEmailForm from './components/AuthEmailForm'

const Auth = () => {
  const ctrl = useAuthScreen()

  const renderContent = () => {
    if (ctrl.stepIndex === 0) {
      return <AuthRoleSelection userRole={ctrl.userRole} setUserRole={ctrl.setUserRole} />
    }

    return <AuthEmailForm state={ctrl.state} handleChange={ctrl.handleChange} />
  }

  return (
    <div className={css.wrapper}>
      <div className="flex-lines gap24 center">
        <div className="flex-lines gap12 center">
          <p className="text-heading-2 text-primary">PowerMarket</p>
          <p className="text-heading-3">Регистрация</p>
        </div>
        <div style={{ width: '33%' }}>
          <StepIndicator stepNames={['', '']} activeStepIndex={ctrl.stepIndex} />
        </div>
        <div className={cn(css.roleSelectionBlock, 'flex-lines gap24 center')}>
          {renderContent()}
          <Button
            disabled={(ctrl.stepIndex === 0 && !ctrl.userRole) || (ctrl.stepIndex === 1 && !ctrl.state.email)}
            onClick={() => (ctrl.stepIndex === 0 ? ctrl.goToNextStep() : ctrl.handleSubmit())}
            fullWidth
            size="default"
            type="primary"
            text={ctrl.stepIndex === 0 ? 'Продолжить' : 'Закончить'}
          />
        </div>
      </div>
    </div>
  )
}

export default Auth
