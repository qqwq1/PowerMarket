import { useRecoilValue } from 'recoil'
import userAtom from '@/pages/User/user.atom'
import MainLayout from '@/shared/Layouts/MainLayout'
import css from './personalAccount.module.css'
import SellerPersonalAccountContent from './components/SellerPersonalAccountContent'
import BuyerPersonalAccountContent from './components/BuyerPersonalAccountContent'

const PersonalAccount = () => {
  const userState = useRecoilValue(userAtom)

  const renderContent = () => {
    if (!userState.user) return null
    if (userState.user.role === 'SUPPLIER') {
      return <SellerPersonalAccountContent />
    }
    if (userState.user.role === 'TENANT') {
      return <BuyerPersonalAccountContent />
    }
  }

  return (
    <MainLayout>
      <div className="height100" style={{ padding: '24px', flex: 1 }}>
        <div className="flex-lines gap16 height100">
          <div className={css.wrapper}>
            <h1 className="text-heading-3" style={{ margin: 0 }}>
              Личный кабинет
            </h1>
            {renderContent()}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default PersonalAccount
