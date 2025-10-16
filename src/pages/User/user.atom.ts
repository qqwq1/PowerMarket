import { atom } from 'recoil'
import { TUserRole } from './user.types'

export interface IUser {
  userRole: TUserRole | null
}

const userAtom = atom<IUser>({
  key: 'self/user',
  default: {
    userRole: null,
  },
})

export default userAtom
