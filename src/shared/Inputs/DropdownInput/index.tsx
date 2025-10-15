import { CSSProperties, ReactNode, useMemo, useRef, useState } from 'react'
import { IDropdownGroupOption, TDropdownOption } from '@/shared/Inputs/DropdownInput/dropdown.types.ts'
import { Primitive } from '@/types/global.ts'
import css from './dropdown.module.css'
import cn from '../../../utils/cn.ts'
import ArrowDown from '@/assets/icons/arrowDown.svg?react'
import usePopup from '../../hooks/usePopup.ts'
import dropdownUtils from '@/shared/Inputs/DropdownInput/dropdown.utils.ts'
import DropdownSubmenuListItem from '@/shared/Dropdowns/DropdownListItem/DropdownSubmenuListItem'
import DropdownListItemGoBack from '@/shared/Dropdowns/DropdownListItem/DropdownListItemGoBack'
import DropdownFadeInPanel from '@/shared/Dropdowns/DropdownFadeInPanel'
import DropdownInputListItem from '@/shared/Dropdowns/DropdownInputListItem/index.tsx'

interface IProps<T extends Primitive> {
  options: TDropdownOption[]
  selectedOption: T
  name?: string
  title: string | ReactNode
  onSelect: (option: T, name: string, groupKey?: IDropdownGroupOption['key']) => void
  disabled?: boolean
  menuStyle?: CSSProperties
  wrapperStyle?: CSSProperties
  type?: 'default' | 'inline'
  // Передается в случае, если переданный список опций содержит nested-элементы
  groupKey?: string
  loading?: boolean
}

const DropdownInput = <T extends Primitive>({ type = 'default', ...props }: IProps<T>) => {
  const ref = useRef<HTMLDivElement>(null)
  const { open, setOpen } = usePopup(ref)
  const [path, setPath] = useState<Array<IDropdownGroupOption['key']>>([])

  const handleGoBack = (ev) => {
    ev.stopPropagation()
    setPath((prev) => path.slice(0, prev.length - 2))
  }

  const handleChange = (optionValue: T) => () => {
    if (props.disabled) return

    props.onSelect(optionValue, props.name, path[path.length - 1])
    setOpen(false)
  }

  const flattenOptions = useMemo(() => {
    return dropdownUtils.flattenOptions(props.options)
  }, [props.options])

  const selectedOption = useMemo(() => {
    return flattenOptions.find(
      (o) => o.value === props.selectedOption && (props.groupKey ? props.groupKey === o.groupKey : true)
    )
  }, [props.selectedOption, flattenOptions])

  const selectedGroupOptions = useMemo(() => {
    if (!path.length) return props.options

    const groupKey = path[path.length - 1]
    return dropdownUtils.getGroupOptions(props.options, groupKey)
  }, [props.options, path])

  const renderOption = (option: TDropdownOption) => {
    if ('children' in option) {
      return (
        <DropdownSubmenuListItem
          key={option.key}
          onClick={(ev) => {
            ev.stopPropagation()
            setPath((prev) => [...prev, (option as any).key])
          }}
          text={option.title}
        />
      )
    }

    return (
      <DropdownInputListItem
        key={option.value as any}
        onClick={handleChange(option.value)}
        active={option.value === selectedOption?.value}
      >
        <p className="text-nm">{option.title}</p>
      </DropdownInputListItem>
    )
  }

  return (
    <div
      ref={ref}
      className={css.wrapper}
      data-open={open}
      style={props.wrapperStyle}
      onClick={() => !props.disabled && setOpen(!open)}
      data-type={type}
      data-disabled={props.disabled}
    >
      <div
        data-open={open}
        className={cn({ 'text-nm line-clamp': true, 'text-placeholder': !Boolean(selectedOption) })}
        title={(selectedOption?.title ?? props.title).toString()}
      >
        {selectedOption?.title ?? props.title}
      </div>

      {!props.disabled && <ArrowDown data-open={open} data-selected={Boolean(selectedOption)} className={css.arrow} />}
      <DropdownFadeInPanel open={open} style={props.menuStyle}>
        {Boolean(path.length) && <DropdownListItemGoBack text="Назад" onClick={handleGoBack} />}
        {selectedGroupOptions.map(renderOption)}
        {props.loading && <span className="text-nm text-secondary">Загрузка ...</span>}
      </DropdownFadeInPanel>
    </div>
  )
}

export default DropdownInput
