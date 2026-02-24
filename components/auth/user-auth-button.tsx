"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { LogOut } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserProfileAvatar } from "@/components/ui/user-profile-avatar"

export function UserAuthButton() {
  const { user, loading, signInWithGoogle, signOut, guestLogin } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleGuest = () => {
    guestLogin()
  }

  if (loading) {
    return null
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full p-0">
            <UserProfileAvatar user={user} size="sm" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="flex flex-col">
            <span className="font-medium">{user.displayName || "User"}</span>
            {user.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Dropdown for sign in options
  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          aria-haspopup="menu"
        >
          Sign In
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleSignIn} disabled={isSigningIn} className="gap-2">
          <FcGoogle className="h-4 w-4" />
          {isSigningIn ? "Signing in..." : "Sign in with Google"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleGuest}>
          <span role="img" aria-label="Guest" className="mr-2">👤</span>
          Continue as Guest
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
