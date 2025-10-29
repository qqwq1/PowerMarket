import Factory from '@/assets/images/factory.svg?react'
import MagnifyingGlass from '@/assets/images/magnifyingGlassSearch.svg?react'
import css from './authRoleSelection.module.css'

interface IProps {
  userRole: 'seller' | 'buyer' | null
  setUserRole: (role: 'seller' | 'buyer') => void
}

const AuthRoleSelection = ({ userRole, setUserRole }: IProps) => {
  return (
    <>
      <h3>Что вы хотите сделать?</h3>
      <div className="inline-flex-gap gap16">
        <div
          className={css.roleSelectionButton}
          onClick={() => setUserRole('buyer')}
          data-active={userRole === 'buyer'}
        >
          <Factory width="64px" />
          <h6 className="text-lg">Предложить свои мощности</h6>
          <p className="text-nm text-secondary text-center">Разместить оборудование или услуги для аренды</p>
        </div>
        <div
          className={css.roleSelectionButton}
          onClick={() => setUserRole('seller')}
          data-active={userRole === 'seller'}
        >
          <MagnifyingGlass width="64px" />
          <h6 className="text-lg">Найти мощности</h6>
          <p className="text-nm text-secondary text-center">Опубликовать заказ на выполнение работы</p>
        </div>
      </div>
    </>
  )
}

export default AuthRoleSelection
