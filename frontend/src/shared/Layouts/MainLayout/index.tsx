import css from './mainLayout.module.css'
import LogoSvg from '@/assets/logo.svg?react'
import CatalogSvg from '@/assets/icons/catalog.svg?react'
import UserSvg from '@/assets/icons/userLine.svg?react'
import { useRecoilValue } from 'recoil'
import NavigationItem from './components/NavigationItem'
import urls from '../../../navigation/urls.ts'
import userAtom from '@/pages/User/user.atom.ts'
import { PropsWithChildren } from 'react'
import Button from '@/shared/Buttons/Button/index.tsx'
import useLogout from '@/pages/User/hooks/useLogout.ts'

const MainLayout = (props: PropsWithChildren) => {
  const userState = useRecoilValue(userAtom)
  const logoutAction = useLogout()

  if (!userState.user) return null

  return (
    <div className={css.wrapper}>
      <div className={css.header}>
        <div className={css.headerShadow} />
        <div className="flex-space-between">
          <div className="inline-flex-gap gap16 center">
            <div className="inline-flex-gap gap12 center" style={{ paddingLeft: '12px' }}>
              <LogoSvg height="32px" />
              <span className="text-nm-bold text-default">PowerMarket</span>
            </div>
          </div>
          <div className="inline-flex-gap gap16 center">
            <span className="text-nm text-default text-center">
              {`Добрый день, ${userState.user.role === 'SUPPLIER' ? 'исполнитель' : 'заказчик'}!`}
            </span>
            <Button size="default" type="default" text="Выйти" onClick={logoutAction} />
          </div>
        </div>
      </div>
      <div className={css.contentWrapper}>
        <nav className={css.nav} data-open={true}>
          <div className={css.navShadow} />
          <div className="flex-lines" style={{ gap: '2px' }}>
            <NavigationItem
              matchPrefixes={[urls.equipmentLots]}
              icon={<CatalogSvg style={{ width: '16px', height: '16px', flexShrink: 0 }} />}
              title="Каталог"
              navItems={[{ title: 'Каталог', to: urls.equipmentLots }]}
            />
            <NavigationItem
              matchPrefixes={[urls.personalAccount]}
              icon={<UserSvg style={{ width: '16px', height: '16px', flexShrink: 0, color: '#000' }} />}
              title="Личный кабинет"
              navItems={[{ title: 'Личный кабинет', to: urls.personalAccount }]}
            />
          </div>
        </nav>
        <div className={css.content}>{props.children}</div>
      </div>
    </div>
  )
}

export default MainLayout
