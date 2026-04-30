import { createContext, useEffect, useState } from "react"
import api from "../api/axios"

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /* =========================
     Restore + VALIDATE login on refresh
     1. Load from localStorage immediately (fast paint)
     2. Hit backend to confirm token is still valid
     3. If backend returns 401, clear everything → user goes to login
  ========================= */

  useEffect(() => {

    const token     = sessionStorage.getItem("gs_token")
    const cached    = sessionStorage.getItem("gs_user")

    if (!token || !cached) {
      setLoading(false)
      return
    }

    // Optimistic restore so the dashboard renders immediately
    let parsed = null
    try {
      parsed = JSON.parse(cached)
      setUser(parsed)
    } catch {
      sessionStorage.removeItem("gs_user")
      setLoading(false)
      return
    }

    // Background validation — confirms the token is still accepted by the backend
    const validateToken = async () => {
      try {
        const role = parsed?.role?.toUpperCase()
        // Pick the right profile endpoint based on role
        let endpoint = "/student/profile"
        if (role === "TEACHER") endpoint = "/teacher/profile"
        else if (role === "ADMIN") endpoint = "/admin/auth/me"

        const { data } = await api.get(endpoint)

        // Merge any fresh server data (e.g. classLevel which students need for exam filtering)
        const refreshed = {
          id:        data.id        ?? parsed.id,
          username:  data.username  ?? parsed.username,
          fullName:  data.fullName  ?? parsed.fullName,
          role:      data.role      ?? parsed.role,
          classLevel: data.classLevel ?? parsed.classLevel ?? null,
        }
        sessionStorage.setItem("gs_user", JSON.stringify(refreshed))
        setUser(refreshed)
      } catch {
        // Token rejected by backend — clear everything
        sessionStorage.removeItem("gs_token")
        sessionStorage.removeItem("gs_user")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    validateToken()

  }, [])

  /* =========================
     LOGIN
  ========================= */

  const login = async (username, password) => {

    const endpoints = [
      "/admin/auth/login",
      "/teacher/auth/login",
      "/student/login"
    ]

    let lastError = null

    for (const ep of endpoints) {
      try {
        const { data } = await api.post(ep, { username, password })

        const userData = {
          id:         data.userId,
          username:   data.username,
          fullName:   data.fullName,
          role:       data.role,
          classLevel: data.classLevel ?? null,   // students need this for exam filtering
        }

        // Save token + user
        sessionStorage.setItem("gs_token", data.token)
        sessionStorage.setItem("gs_user", JSON.stringify(userData))

        setUser(userData)

        return userData
      } catch (err) {
        lastError = err
        // If credentials are simply wrong (not a role mismatch), stop trying
        const msg = err?.response?.data?.message || ""
        if (msg === "Invalid credentials") {
          throw err
        }
        // Otherwise (role mismatch), try the next endpoint
      }
    }

    // All endpoints failed
    throw lastError
  }

  /* =========================
     REGISTER
  ========================= */

  const register = async (payload) => {

    const { data } = await api.post("/auth/register", payload)

    const userData = {
      id: data.id,
      username: data.username,
      fullName: data.fullName,
      role: data.role
    }

    sessionStorage.setItem("gs_token", data.token)
    sessionStorage.setItem("gs_user", JSON.stringify(userData))

    setUser(userData)

    return userData
  }

  /* =========================
     LOGOUT
  ========================= */

  const logout = () => {

    sessionStorage.removeItem("gs_token")
    sessionStorage.removeItem("gs_user")
    sessionStorage.removeItem("lastScore")

    setUser(null)

  }

  /* =========================
     CONTEXT VALUE
  ========================= */

  const value = {
    user,
    loading,
    login,
    register,
    logout
  }

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  )
}