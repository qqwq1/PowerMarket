import css from './navigationItem.module.css'
import { memo, ReactNode, useRef } from 'react'
import ArrowRight from '../../../../../assets/icons/arrowRight.svg?react'
import { Link, useNavigate } from 'react-router-dom'
import FadeInPanel from '../../../../Animated/FadeInPanel'
import usePopup from '../../../../hooks/usePopup'

interface IProps {
  icon: ReactNode
  title: string
  navItems: Array<{ title: string; to: string }>

  matchPrefixes: string[]
}

const NavigationItem = (props: IProps) => {
  const navigate = useNavigate()

  const ref = useRef<HTMLDivElement>(null)
  const { open, setOpen } = usePopup(ref)

  const menuContent = props.navItems.map((it) => (
    <Link key={it.to} to={it.to} className={css.navOption}>
      <span className="text-nm">{it.title}</span>
    </Link>
  ))

  const handleClick = () => {
    if (props.navItems.length > 1) {
      setOpen((prev) => !prev)
    } else if (props.navItems.length === 1) {
      navigate(props.navItems[0].to)
    }
  }

  return (
    <div className={css.wrapper} data-open={open} ref={ref} onClick={handleClick}>
      <div className="inline-flex-gap gap24 center">
        {props.icon}
        <p className="text-nm line-clamp" style={{ color: 'inherit' }}>
          {props.title}
        </p>
      </div>
      <ArrowRight style={{ width: '16px', height: '16px' }} />
      <FadeInPanel open={open} className={css.navMenu}>
        {menuContent}
      </FadeInPanel>
    </div>
  )
}

export default memo(NavigationItem)
