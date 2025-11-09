import http, { handleHttpError, handleHttpResponse } from '@/services/http'
import { HTTPResponse } from '@/services/http/http.types'
import { IUser } from './user.types'

const getUser = (): Promise<HTTPResponse<IUser>> => {
  return http.get('/api/auth/me').then(handleHttpResponse).catch(handleHttpError)
}

const userApi = { getUser }

export default userApi
