"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useRef } from "react"
import { type User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  guestLogin: () => void
  guestLogout: () => void
  isGuest: boolean
  guestTimeLeft: number | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [guestTimeLeft, setGuestTimeLeft] = useState<number | null>(null)
  const guestSessionDuration = 5 * 60; // 5 minutes in seconds
  const guestTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase auth not initialized")
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      if (user) {
        setIsGuest(false)
        setGuestTimeLeft(null)
        if (guestTimerRef.current) clearInterval(guestTimerRef.current)
      }
    })

    return () => unsubscribe()
  }, [])

  // Guest login logic
  const guestLogin = () => {
    setIsGuest(true)
    setUser(null)
    setGuestTimeLeft(guestSessionDuration)
    if (guestTimerRef.current) clearInterval(guestTimerRef.current)
    guestTimerRef.current = setInterval(() => {
      setGuestTimeLeft((prev) => {
        if (prev === null) return null
        if (prev <= 1) {
          setIsGuest(false)
          setGuestTimeLeft(null)
          if (guestTimerRef.current) clearInterval(guestTimerRef.current)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const guestLogout = () => {
    setIsGuest(false)
    setGuestTimeLeft(null)
    if (guestTimerRef.current) clearInterval(guestTimerRef.current)
  }

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      console.error("Firebase not initialized")
      return
    }
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Error signing in with Google:", error)
    }
  }

  const signOut = async () => {
    if (!auth) {
      console.error("Firebase not initialized")
      guestLogout()
      return
    }
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
    guestLogout()
  }

  return <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, guestLogin, guestLogout, isGuest, guestTimeLeft }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
