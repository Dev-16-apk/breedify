"use client"

import { useRef } from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "./api"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [inactivityTimeout, setInactivityTimeout] = useState(30) // minutes
  const inactivityTimerRef = useRef(null)

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const savedUser = localStorage.getItem("breedify_user")
        const token = localStorage.getItem("breedify_token")
        const savedTimeout = localStorage.getItem("breedify_inactivity_timeout")

        if (savedTimeout) {
          setInactivityTimeout(Number.parseInt(savedTimeout))
        }

        if (savedUser && token) {
          // Verify token is still valid by calling getCurrentUser
          try {
            const userData = await authAPI.getCurrentUser()
            setUser(userData)
            startInactivityTimer()
          } catch (err) {
            // Token invalid or backend unavailable, clear storage
            localStorage.removeItem("breedify_user")
            localStorage.removeItem("breedify_token")
          }
        }
      } catch (err) {
        console.error("Session check error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [])

  const startInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }

    inactivityTimerRef.current = setTimeout(
      () => {
        console.log("[v0] Inactivity timeout reached, logging out user")
        logout()
      },
      inactivityTimeout * 60 * 1000,
    )
  }

  const resetInactivityTimer = () => {
    if (user) {
      startInactivityTimer()
    }
  }

  useEffect(() => {
    if (!user) return

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"]

    const handleActivity = () => {
      resetInactivityTimer()
    }

    events.forEach((event) => {
      document.addEventListener(event, handleActivity)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [user, inactivityTimeout])

  const login = async (emailOrPhone, password) => {
    setIsLoading(true)
    setError(null)
    try {
      // Try backend API first
      try {
        const response = await authAPI.login(emailOrPhone, password)
        const { user: userData, token } = response

        localStorage.setItem("breedify_token", token)
        localStorage.setItem("breedify_user", JSON.stringify(userData))
        setUser(userData)
        return true
      } catch (apiError) {
        if (apiError.isNetworkError || apiError.message.includes("Failed to fetch")) {
          console.warn("Backend API not available, using demo credentials")

          await new Promise((resolve) => setTimeout(resolve, 1000))

          const demoUsers = {
            "officer@breedify.gov.in": {
              id: "1",
              name: "Field Officer",
              role: "field_officer",
              email: "officer@breedify.gov.in",
            },
            9876543210: { id: "1", name: "Field Officer", role: "field_officer", email: "officer@breedify.gov.in" },
            "vet@breedify.gov.in": {
              id: "2",
              name: "Dr. Veterinarian",
              role: "veterinarian",
              email: "vet@breedify.gov.in",
            },
            9876543211: { id: "2", name: "Dr. Veterinarian", role: "veterinarian", email: "vet@breedify.gov.in" },
            "admin@breedify.gov.in": { id: "3", name: "System Admin", role: "admin", email: "admin@breedify.gov.in" },
            9876543212: { id: "3", name: "System Admin", role: "admin", email: "admin@breedify.gov.in" },
          }

          const normalized = emailOrPhone.toLowerCase().trim()
          const normalizedPassword = password.trim()

          if (normalized in demoUsers && normalizedPassword === "demo123") {
            const userData = demoUsers[normalized]
            localStorage.setItem("breedify_user", JSON.stringify(userData))
            localStorage.setItem("breedify_token", "demo_token_" + userData.id)
            setUser(userData)
            return true
          }

          setError("Invalid credentials. Please try again.")
          return false
        }
        throw apiError
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err.message || "Login failed")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email, password, name, role = "field_officer") => {
    setIsLoading(true)
    setError(null)
    try {
      try {
        const response = await authAPI.signup(email, password, name, role)
        const { user: userData, token } = response

        localStorage.setItem("breedify_token", token)
        localStorage.setItem("breedify_user", JSON.stringify(userData))
        setUser(userData)
        return true
      } catch (apiError) {
        if (apiError.isNetworkError || apiError.message.includes("Failed to fetch")) {
          console.warn("Backend API not available, using demo signup")

          await new Promise((resolve) => setTimeout(resolve, 1500))

          const userData = {
            id: Date.now().toString(),
            email: email.toLowerCase().trim(),
            name,
            role,
          }

          localStorage.setItem("breedify_user", JSON.stringify(userData))
          localStorage.setItem("breedify_token", "demo_token_" + userData.id)
          setUser(userData)
          return true
        }
        throw apiError
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError(err.message || "Signup failed")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      console.warn("Logout API call failed:", err)
    }

    setUser(null)
    localStorage.removeItem("breedify_user")
    localStorage.removeItem("breedify_token")
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, error }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
