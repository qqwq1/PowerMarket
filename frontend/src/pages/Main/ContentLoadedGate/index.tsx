import { PropsWithChildren, useEffect } from 'react'
import useHttpLoader from '../../../shared/hooks/useHttpLoader.ts'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import css from './contentLoaderGate.module.css'
import authAtom from '../../Auth/auth.atom.ts'
import userAtom from '@/pages/User/user.atom.ts'
import userApi from '@/pages/User/user.api.ts'

const ContentLoadedGate = (props: PropsWithChildren) => {
  const isLoaded = useRecoilValue(userAtom).loaded
  const { wait } = useHttpLoader()
  const authState = useRecoilValue(authAtom)

  const setUserState = useSetRecoilState(userAtom)

  useEffect(() => {
    if (isLoaded || authState.authState !== 'authorized') return

    wait(userApi.getUser(), (resp) => {
      if (resp.status === 'success') {
        setUserState({ loaded: true, user: resp.body })
      }
    })
  }, [authState.authState])

  if (!isLoaded) {
    return (
      <div className={css.wrapper}>
        <p className="text-lg">Инициализация...</p>
      </div>
    )
  }

  return <>{props.children}</>
}

export default ContentLoadedGate
