import { AnyObject } from '../../global.types.ts'

const removeItem = <T extends AnyObject>(prev: T[], index: number): T[] => {
  return [...prev.slice(0, index), ...prev.slice(index + 1)]
}

const formsUtils = {
  arrays: {
    removeItem,
  },
}
export default formsUtils
