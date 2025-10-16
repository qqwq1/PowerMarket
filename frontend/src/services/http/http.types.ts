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
  totalCount: number
  nextPage: string | null
  prevPage: string | null
  items: T[]
}

export interface IPaginationRequestQuery {
  limit?: number
  page?: string
}

export type HTTPResponse<T = undefined> = IHTTPErrorResponse | IHTTPSuccessResponse<T>

type IOmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never

export interface IAbortableRequest<T extends (...args: any[]) => any> {
  (...args: Parameters<IOmitFirstArg<T>>): Promise<Awaited<ReturnType<T>>>
  abort: () => void
}

export type ISignalable = (signal: AbortController['signal'], ...args: any[]) => any
