import { CSSProperties, ReactNode } from 'react'
import css from './basicTable.module.css'
import cn from '@/utils/cn'

type TableValue = ReactNode | string | number

interface IBaseProps {
  values: TableValue[][]
  wrapperStyles?: CSSProperties
  rowStyles?: CSSProperties
  getCellStyle?: (rowIndex: number, colIndex: number) => CSSProperties | null
}

type IProps =
  | (IBaseProps & { columns: TableValue[]; colCount?: never })
  | (IBaseProps & { columns?: never; colCount: number })

const BasicTable = (props: IProps) => {
  const renderHeader = () => {
    if (!props.columns || props.columns.length === 0) return null
    return (
      <div className={cn(css.item, css.header)} style={{ gridTemplateColumns: `repeat(${props.columns.length}, 1fr)` }}>
        {props.columns.map((col, colIndex) => (
          <div key={colIndex} className={css.itemCell}>
            {typeof col === 'string' || typeof col === 'number' ? <span className="text-heading-6">{col}</span> : col}
          </div>
        ))}
      </div>
    )
  }

  const renderValues = () => {
    const colCount = props.columns?.length ?? props.colCount
    return props.values.map((value, rowIndex) => (
      <div
        className={css.item}
        key={rowIndex}
        style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)`, ...(props.rowStyles || {}) }}
      >
        {value.map((item, cellIndex) => (
          <div
            className={css.itemCell}
            key={rowIndex + cellIndex}
            style={props?.getCellStyle ? props.getCellStyle(rowIndex, cellIndex) : {}}
          >
            {typeof item === 'string' || typeof item === 'number' ? <span className="text-nm">{item}</span> : item}
          </div>
        ))}
      </div>
    ))
  }

  return (
    <div className={css.wrapper} style={props.wrapperStyles || {}}>
      {renderHeader()} {renderValues()}
    </div>
  )
}

export default BasicTable
