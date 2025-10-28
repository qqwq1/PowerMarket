import { useRecoilValue } from 'recoil'
import userAtom from '@/pages/User/user.atom'
import MainLayout from '@/shared/Layouts/MainLayout'
import SellerPersonalAccountContent from './components/SellerPersonalAccountContent'
import BuyerPersonalAccountContent from './components/BuyerPersonalAccountContent'
import css from './personalAccount.module.css'

const PersonalAccount = () => {
  const { userRole } = useRecoilValue(userAtom)

  const renderContent = () => {
    if (userRole === 'seller') {
      return <SellerPersonalAccountContent />
    }
    if (userRole === 'buyer') {
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
