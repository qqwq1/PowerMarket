import http, { handleHttpError, handleHttpResponse } from '../../services/http'
import { HTTPResponse } from '../../services/http/http.types.ts'
import { IUser } from '../User/user.types.ts'

export interface ILoginResponse {
  auth: {
    accessToken: string
    expires: number // ts
  }
  user: IUser
}

const login = (dto: {
  login: string
  password: string
  rememberMe: boolean
}): Promise<HTTPResponse<ILoginResponse>> => {
  return http.post('/api/auth/login', dto).then(handleHttpResponse).catch(handleHttpError)
}

const refreshToken = async (): Promise<HTTPResponse<ILoginResponse>> => {
  return http.post('/api/auth/refresh').then(handleHttpResponse).catch(handleHttpError)
}

const logout = async (): Promise<HTTPResponse<{}>> => {
  return http.post('/api/auth/logout').then(handleHttpResponse).catch(handleHttpError)
}

const register = async (): Promise<HTTPResponse<{}>> => {
  return http.post('/api/auth/register').then(handleHttpResponse).catch(handleHttpError)
}

const authApi = { refreshToken, login, logout }
export default authApi
