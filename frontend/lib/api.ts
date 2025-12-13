const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export class ApiClient {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('jwt_token')
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }
    return {
      'Content-Type': 'application/json',
    }
  }

  private buildQuery(params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) return ''

    const usp = new URLSearchParams()

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue

      if (Array.isArray(value)) {
        value.forEach((v) => usp.append(key, String(v)))
      } else if (typeof value === 'object') {
        usp.append(key, JSON.stringify(value))
      } else {
        usp.append(key, String(value))
      }
    }

    const qs = usp.toString()
    return qs ? `?${qs}` : ''
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = this.getAuthHeader()

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || `HTTP error! status: ${response.status}`)
    }

    // Если 204 No Content, не пытаться парсить json
    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const endpointWithQuery = `${endpoint}${this.buildQuery(params)}`
    return this.request<T>(endpointWithQuery, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiClient()

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),

  register: (data: RegisterData) => api.post<{ token: string; user: User }>('/auth/register', data),

  getCurrentUser: () => api.get<User>('/auth/me'),
}

// Types
export interface User {
  id: string
  email: string
  companyName: string
  role: 'SUPPLIER' | 'TENANT'
  averageRating?: number
}

export interface RegisterData {
  email: string
  password: string
  companyName: string
  role: 'SUPPLIER' | 'TENANT'
}
