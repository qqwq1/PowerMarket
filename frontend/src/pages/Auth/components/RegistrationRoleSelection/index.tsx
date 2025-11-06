import Factory from '@/assets/images/factory.svg?react'
import MagnifyingGlass from '@/assets/images/magnifyingGlassSearch.svg?react'
import css from './registrationRoleSelection.module.css'
interface IProps {
  userRole: 'SUPPLIER' | 'TENANT'
  setUserRole: (role: 'SUPPLIER' | 'TENANT') => void
}

const RegistrationRoleSelection = ({ userRole, setUserRole }: IProps) => {
  return (
    <>
      <h3>Что вы хотите сделать?</h3>
      <div className="inline-flex-gap gap16">
        <div
          className={css.roleSelectionButton}
          onClick={() => setUserRole('SUPPLIER')}
          data-active={userRole === 'SUPPLIER'}
        >
          <Factory width="64px" />
          <h6 className="text-lg">Предложить свои мощности</h6>
          <p className="text-nm text-secondary text-center">Разместить оборудование или услуги для аренды</p>
        </div>
        <div
          className={css.roleSelectionButton}
          onClick={() => setUserRole('TENANT')}
          data-active={userRole === 'TENANT'}
        >
          <MagnifyingGlass width="64px" />
          <h6 className="text-lg">Найти мощности</h6>
          <p className="text-nm text-secondary text-center">Опубликовать заказ на выполнение работы</p>
        </div>
      </div>
    </>
  )
}

export default RegistrationRoleSelection
