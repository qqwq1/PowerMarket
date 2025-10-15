import PlusIcon from '@/assets/icons/plus.svg?react'
import DropdownListItem from '@/shared/Dropdowns/DropdownListItem'

interface IProps {
  text: string
  onClick: () => void
}

const DropdownListItemCreate = (props: IProps) => {
  return (
    <DropdownListItem icon={<PlusIcon className="text-default" />} onClick={props.onClick}>
      <p className="text-nm">{props.text}</p>
    </DropdownListItem>
  )
}

export default DropdownListItemCreate
