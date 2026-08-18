import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const INITIAL_USERS = [
  { id: 1, username: 'admin', email: 'admin@test.com', password: 'admin123' },
  { id: 2, username: 'user', email: 'user@test.com', password: 'user123' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem('registeredUsers')
    const registered = stored ? JSON.parse(stored) : []
    return [...INITIAL_USERS, ...registered]
  })

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user))
  }, [user])

  const login = (username, password) => {
    const found = users.find(
      (u) => u.username === username && u.password === password,
    )
    if (found) {
      const { password: _, ...userData } = found
      setUser(userData)
      return { success: true }
    }
    return { success: false, error: 'Credenciales incorrectas' }
  }

  const register = (username, email, password) => {
    if (users.find((u) => u.username === username)) {
      return { success: false, error: 'El usuario ya existe' }
    }
    if (users.find((u) => u.email === email)) {
      return { success: false, error: 'El email ya está registrado' }
    }
    const newUser = { id: users.length + 1, username, email, password }
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)

    const registered = updatedUsers.filter(
      (u) => !INITIAL_USERS.find((init) => init.id === u.id),
    )
    localStorage.setItem('registeredUsers', JSON.stringify(registered))

    return { success: true }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
