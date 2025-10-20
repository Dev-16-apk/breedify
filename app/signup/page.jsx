"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../lib/auth"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { BreedifyLogo } from "../../components/breedify-logo"
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { signup } = useAuth()
  const router = useRouter()

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    if (!formData.role) {
      setError("Please select your role")
      setIsLoading(false)
      return
    }

    const success = await signup(formData.email, formData.password, formData.name, formData.role)
    if (success) {
      router.push("/dashboard")
    } else {
      setError("Failed to create account. Please try again.")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 animate-pulse">
          <svg viewBox="0 0 100 100" className="w-full h-full text-teal-600">
            <circle cx="50" cy="50" r="2" fill="currentColor" />
            <circle cx="30" cy="30" r="1" fill="currentColor" />
            <circle cx="70" cy="70" r="1.5" fill="currentColor" />
            <path d="M20 50h60M50 20v60" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          </svg>
        </div>
        <div className="absolute bottom-32 right-32 w-24 h-24 animate-pulse" style={{ animationDelay: "1s" }}>
          <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-500">
            <rect x="40" y="40" width="20" height="20" fill="currentColor" opacity="0.6" />
            <circle cx="25" cy="25" r="3" fill="currentColor" />
            <circle cx="75" cy="75" r="2" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <BreedifyLogo className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl font-bold text-balance text-stone-800">Create Account</CardTitle>
            <CardDescription className="text-base text-pretty text-stone-600">
              Join the Breedify livestock classification system
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-stone-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-teal-500/20 border-stone-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-stone-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-teal-500/20 border-stone-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-stone-700">
                  Role
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger className="h-11 border-stone-200">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="field_officer">Field Officer</SelectItem>
                    <SelectItem value="veterinarian">Veterinarian</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-stone-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className="h-11 pr-12 transition-all duration-200 focus:ring-2 focus:ring-teal-500/20 border-stone-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-stone-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-stone-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-stone-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    className="h-11 pr-12 transition-all duration-200 focus:ring-2 focus:ring-teal-500/20 border-stone-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-stone-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-stone-500" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] bg-teal-600 hover:bg-teal-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-stone-600">
                Already have an account?{" "}
                <Link href="/login" className="text-teal-600 hover:underline font-medium">
                  Sign In
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200">
              <div className="text-center space-y-2">
                <p className="text-sm text-stone-600">Authorized personnel only</p>
                <p className="text-xs text-stone-500">Part of Rashtriya Gokul Mission • Government of India</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-stone-600 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
