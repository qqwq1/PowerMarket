import { atom } from 'recoil'
import { IUser } from './user.types'

interface IUserState {
  user: IUser
}

const userAtom = atom<IUserState>({
  key: 'self/user',
  default: {
    user: null,
  },
})

export default userAtom
