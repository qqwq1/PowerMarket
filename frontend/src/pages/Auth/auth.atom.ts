import { atom } from 'recoil'

export interface IAuthState {
  accessToken: string
  expires: number
  authState: 'unknown' | 'authorized' | 'not-authorized'
}

export const initialAuthState: IAuthState = {
  expires: 0,
  accessToken: '',
  authState: 'unknown',
}

const authAtom = atom<IAuthState>({
  default: initialAuthState,
  key: 'auth',
})
export default authAtom
