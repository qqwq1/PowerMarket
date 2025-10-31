import { atom } from 'recoil'
import { TUserRole } from './user.types'

interface IUser {
  userRole: TUserRole | null
}

// type TUserRole = 'ADMIN' | 'SUPPLIER' | 'TENANT'

const userAtom = atom<IUser>({
  key: 'self/user',
  default: {
    userRole: null,
  },
})

export default userAtom
