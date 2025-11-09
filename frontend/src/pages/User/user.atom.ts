import { atom } from 'recoil'
import { IUser } from './user.types'

interface IUserState {
  user: IUser
  loaded: boolean
}

const userAtom = atom<IUserState>({
  key: 'self/user',
  default: {
    user: null,
    loaded: false,
  },
})

export default userAtom
