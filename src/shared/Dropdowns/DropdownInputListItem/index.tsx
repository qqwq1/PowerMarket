import { PropsWithChildren, ReactNode, MouseEvent, CSSProperties } from 'react'
import DropdownListItem from '../DropdownListItem'
import CheckedIcon from '../../../assets/icons/checked.svg?react'

interface IProps {
  icon?: ReactNode
  active?: boolean
  disabled?: boolean
  style?: CSSProperties
  onClick?: (ev: MouseEvent<HTMLDivElement>) => void
  onMouseEnter?: () => void
}

const DropdownInputListItem = (props: PropsWithChildren<IProps>) => {
  return (
    <DropdownListItem {...props}>
      <div className="flex-space-between width100">
        {props.children}
        {props.active && <CheckedIcon className="text-primary" />}
      </div>
    </DropdownListItem>
  )
}

export default DropdownInputListItem
