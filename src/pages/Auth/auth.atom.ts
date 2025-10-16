import { atom } from 'recoil'

export interface IAuthState {
  authState: 'unknown' | 'authorized' | 'not-authorized'
}

export const initialAuthState: IAuthState = {
  authState: 'unknown',
}

const authAtom = atom<IAuthState>({
  default: initialAuthState,
  key: 'auth',
})
export default authAtom
