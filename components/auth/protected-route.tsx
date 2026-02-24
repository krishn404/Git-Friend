"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { LoginModal } from "@/components/auth/login-modal"
import { useRouter, usePathname } from "next/navigation"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isGuest } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only show the login modal if the user is not logged in and we're done loading
    if (!loading && !user && !isGuest) {
      setShowLoginModal(true)
    }
  }, [user, loading])

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
  }

  const handleCloseModal = () => {
    setShowLoginModal(false)
    router.push("/")
  }

  if (loading) {
    return null
  }

  return (
    <>
      {(user || isGuest) ? children : null}
      <LoginModal isOpen={showLoginModal} onClose={handleCloseModal} onSuccess={handleLoginSuccess} />
    </>
  )
}
