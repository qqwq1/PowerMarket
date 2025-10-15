import DropdownListItem from '@/shared/Dropdowns/DropdownListItem'
import ArrowRight from '@/assets/icons/arrowRight.svg?react'
import { MouseEvent } from 'react'

interface IProps {
  text: string
  onClick: (ev: MouseEvent<HTMLDivElement>) => void
}

const DropdownSubmenuListItem = (props: IProps) => {
  return (
    <DropdownListItem onClick={props.onClick}>
      <div className="flex-space-between">
        <p className="text-nm">{props.text}</p>
        <ArrowRight className="text-default" />
      </div>
    </DropdownListItem>
  )
}

export default DropdownSubmenuListItem
