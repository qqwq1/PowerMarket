import { IDropdownGroupOption, IDropdownOption, TDropdownOption } from './dropdown.types.ts'

const flattenOptions = (allOptions: TDropdownOption[]): (IDropdownOption & { groupKey?: string })[] => {
  const selectableOptions: (IDropdownOption & { groupKey?: string })[] = []

  const dfs = (options: TDropdownOption[], groupKey?: string) => {
    for (const o of options) {
      if ('value' in o) {
        selectableOptions.push({ ...o, groupKey })
      }
      if ('children' in o && o.children.length) {
        dfs(o.children, o.key)
      }
    }
  }

  dfs(allOptions)

  return selectableOptions
}

const getGroupOptions = (allOptions: TDropdownOption[], groupKey: IDropdownGroupOption['key']) => {
  const dfs = (options: TDropdownOption[]) => {
    for (const o of options) {
      if ('children' in o) {
        if (o.key === groupKey) {
          return o.children
        } else {
          dfs(o.children)
        }
      }
    }
  }

  return dfs(allOptions) || []
}

const dropdownUtils = { flattenOptions, getGroupOptions }
export default dropdownUtils
