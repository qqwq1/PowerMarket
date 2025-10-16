import css from './mainLayout.module.css'
import LogoSvg from '../../../assets/logo.svg?react'
import CatalogSvg from '../../../assets/icons/catalog.svg?react'
import { useRecoilValue } from 'recoil'
import NavigationItem from './components/NavigationItem'
import urls from '../../../navigation/urls.ts'
import userAtom from '../../../pages/User/user.atom.ts'
import { PropsWithChildren } from 'react'

const MainLayout = (props: PropsWithChildren) => {
  const userState = useRecoilValue(userAtom)

  return (
    <div className={css.wrapper}>
      <div className={css.header}>
        <div className={css.headerShadow} />
        <div className="inline-flex-gap gap16 center">
          <div className="inline-flex-gap gap12 center" style={{ paddingLeft: '12px' }}>
            <LogoSvg height="32px" />
            <span className="text-nm-bold text-default">PowerMarket</span>
          </div>
        </div>
        <div className={css.headerControls}>{userState.userRole}</div>
      </div>
      <div className={css.contentWrapper}>
        <nav className={css.nav} data-open={true}>
          <div className={css.navShadow} />
          <div className="flex-lines" style={{ gap: '2px' }}>
            <NavigationItem
              matchPrefixes={['/catalog']}
              icon={<CatalogSvg style={{ width: '16px', height: '16px', flexShrink: 0 }} />}
              title="Каталог"
              navItems={[{ title: 'Каталог', to: urls.catalog }]}
            />
          </div>
        </nav>
        <div className={css.content}>{props.children}</div>
      </div>
    </div>
  )
}

export default MainLayout
