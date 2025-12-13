'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type User, authApi } from './api'
import { useRouter } from 'next/navigation'
import urls from '@/components/layout/urls'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('jwt_token')
    if (token) {
      authApi
        .getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('jwt_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    localStorage.setItem('jwt_token', response.token)
    setUser(response.user)
    router.push(urls.common.main)
  }

  const register = async (data: any) => {
    const response = await authApi.register(data)
    localStorage.setItem('jwt_token', response.token)
    setUser(response.user)
    router.push(urls.common.main)
  }

  const logout = () => {
    localStorage.removeItem('jwt_token')
    setUser(null)
    router.push('/login')
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
