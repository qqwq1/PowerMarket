import Button from '@/shared/Buttons/Button'
import css from './authPage.module.css'
import useAuthScreen from './useAuthScreen'
import StepIndicator from '@/shared/Common/StepIndicator'
import cn from '@/utils/cn'
import Factory from '@/assets/images/factory.svg?react'
import MagnifyingGlass from '@/assets/images/magnifyingGlassSearch.svg?react'
import FormField from '@/shared/Forms/FormField'
import TextInput from '@/shared/Inputs/TextInput'

const Auth = () => {
  const ctrl = useAuthScreen()

  const renderContent = () => {
    switch (ctrl.stepIndex) {
      case 0:
        return (
          <>
            <h3>Что вы хотите сделать?</h3>
            <div className="inline-flex-gap gap16">
              <div
                className={css.roleSelectionButton}
                onClick={() => ctrl.setUserRole('buyer')}
                data-active={ctrl.userRole === 'buyer'}
              >
                <Factory width="64px" />
                <h6 className="text-lg">Предложить свои мощности</h6>
                <p className="text-nm text-secondary text-center">Разместить оборудование или услуги для аренды</p>
              </div>
              <div
                className={css.roleSelectionButton}
                onClick={() => ctrl.setUserRole('seller')}
                data-active={ctrl.userRole === 'seller'}
              >
                <MagnifyingGlass width="64px" />
                <h6 className="text-lg">Найти мощности</h6>
                <p className="text-nm text-secondary text-center">Опубликовать заказ на выполнение работы</p>
              </div>
            </div>
          </>
        )

      default:
        return (
          <FormField label="E-mail" style={{ width: '100%' }}>
            <TextInput
              value={ctrl.state.email}
              name="email"
              type="email"
              onChange={ctrl.handleChange}
              placeHolder="E-mail"
              size="large"
            />
          </FormField>
        )
    }
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
