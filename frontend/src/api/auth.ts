import { client } from './client'

export interface User {
  id: number
  name: string
  email: string
  timezone: string
  roles: string[]
  permissions: string[]
}

export interface LoginResponse {
  token: string
  user: User
}

export const authApi = {
  login: (email: string, password: string) =>
    client.post<LoginResponse>('/auth/login', { email, password }),

  logout: () => client.post('/auth/logout'),

  me: () => client.get<User>('/auth/me'),
}
