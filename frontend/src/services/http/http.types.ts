export interface IHTTPSuccessResponse<T = undefined> {
  status: 'success'
  body: T
}

export interface IHTTPErrorResponse {
  status: 'error'
  message: string
  body?: Record<string, string>
}

export interface IPaginationResponse<T = any> {
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
  content: T[]
}

export interface IPaginationRequestQuery {
  size?: number
  page?: number
}

export type HTTPResponse<T = undefined> = IHTTPErrorResponse | IHTTPSuccessResponse<T>
