import http, { handleHttpError, handleHttpResponse } from '../../services/http'
import { HTTPResponse } from '../../services/http/http.types.ts'
import { IUser, TUserDto } from '../User/user.types.ts'

export interface IAuthResponse {
  token: string
  refreshToken: string
  user: IUser
}

const login = (dto: { login: string; password: string }): Promise<HTTPResponse<IAuthResponse>> => {
  return http.post('/api/auth/login', dto).then(handleHttpResponse).catch(handleHttpError)
}

const refreshToken = async (refreshToken: string): Promise<HTTPResponse<IAuthResponse>> => {
  return http.post('/api/auth/refresh', { refreshToken }).then(handleHttpResponse).catch(handleHttpError)
}

const register = async (userDto: TUserDto & { password: string }): Promise<HTTPResponse<IAuthResponse>> => {
  return http.post('/api/auth/register', userDto).then(handleHttpResponse).catch(handleHttpError)
}

// const logout = async (): Promise<HTTPResponse<{}>> => {
//   return http.post('/api/auth/logout').then(handleHttpResponse).catch(handleHttpError)
// }

const authApi = { refreshToken, login, register }
export default authApi
