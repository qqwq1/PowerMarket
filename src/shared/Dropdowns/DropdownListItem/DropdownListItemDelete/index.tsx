import DeleteIcon from '@/assets/icons/trash.svg?react'
import DropdownListItem from '@/shared/Dropdowns/DropdownListItem'

interface IProps {
  text: string
  onClick: () => void
}

const DropdownListItemDelete = (props: IProps) => {
  return (
    <DropdownListItem icon={<DeleteIcon />} onClick={props.onClick}>
      <p className="text-nm">{props.text}</p>
    </DropdownListItem>
  )
}

export default DropdownListItemDelete
