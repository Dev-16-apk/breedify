"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { BreedifyLogo } from "../components/breedify-logo"
import { useAuth } from "../lib/auth"
import { Zap, Target, Database, Play, ArrowRight, BarChart3, Camera, Brain } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleStartAnalysis = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }

  const handleWatchDemo = () => {
    window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank")
  }

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze cattle and buffalo images with precision",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Precise Measurements",
      description: "Extract accurate body measurements including length, height, chest width, and rump angle",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Standardized Scoring",
      description: "Convert measurements into standardized scores reducing manual errors and bias",
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "BPA Integration",
      description: "Seamlessly connects with BPA systems for PT and PS programs",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
      {/* Header */}
      <header className="border-b border-stone-200/50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BreedifyLogo className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold text-stone-800">Breedify</h1>
                <p className="text-xs text-stone-600">AI Livestock Classification</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {user ? (
                <Button onClick={() => router.push("/dashboard")} className="bg-teal-600 hover:bg-teal-700">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/login")}
                    className="text-stone-700 hover:text-stone-900"
                  >
                    Sign In
                  </Button>
                  <Button onClick={() => router.push("/signup")} className="bg-teal-600 hover:bg-teal-700">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div
            className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <Badge variant="secondary" className="mb-6 bg-teal-100 text-teal-800 border-teal-200">
              <Zap className="h-3 w-3 mr-1" />
              Powered by Advanced AI Technology
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold text-stone-800 mb-6 text-balance">
              Revolutionize Cattle and Buffalo Breeding
              <span className="text-teal-600"> with AI Precision</span>
            </h1>

            <p className="text-xl text-stone-600 mb-8 text-pretty max-w-3xl mx-auto leading-relaxed">
              Automated image analysis for cattle and buffalo classification. Extract precise measurements, generate
              standardized scores, and streamline your breeding programs with cutting-edge AI technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                onClick={handleStartAnalysis}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg font-semibold group transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Camera className="h-5 w-5 mr-2" />
                Start Analysis
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleWatchDemo}
                className="border-stone-300 text-stone-700 hover:bg-stone-50 px-8 py-4 text-lg font-semibold group transition-all duration-300 hover:scale-105 bg-transparent"
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-800 mb-4">Why Choose Breedify?</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Our AI-powered platform brings precision and efficiency to livestock breeding programs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`border-stone-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 text-teal-600 rounded-lg mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-stone-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-stone-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-800 text-stone-300 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BreedifyLogo className="h-8 w-8 text-teal-500" />
            <span className="text-xl font-bold text-white">Breedify</span>
          </div>
          <p className="text-sm">© 2025 Breedify. Empowering livestock breeding with AI technology.</p>
        </div>
      </footer>
    </div>
  )
}
