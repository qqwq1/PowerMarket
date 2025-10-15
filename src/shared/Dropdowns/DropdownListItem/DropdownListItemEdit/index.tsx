import EditIcon from '@/assets/icons/edit.svg?react'
import DropdownListItem from '@/shared/Dropdowns/DropdownListItem'

interface IProps {
  text: string
  onClick: () => void
  disabled?: boolean
}

const DropdownListItemEdit = (props: IProps) => {
  return (
    <DropdownListItem icon={<EditIcon className="text-default" />} onClick={props.onClick} disabled={props.disabled}>
      <p className="text-nm">{props.text}</p>
    </DropdownListItem>
  )
}

export default DropdownListItemEdit
