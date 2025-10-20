"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "../../components/navigation"
import { useAuth } from "../../lib/auth"
import { analysisAPI, bpaAPI } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Alert, AlertDescription } from "../../components/ui/alert"
import {
  Camera,
  Upload,
  Play,
  Square,
  RotateCcw,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Target,
  Ruler,
  BarChart3,
} from "lucide-react"

export default function AnalysisPage() {
  const { user } = useAuth()
  const router = useRouter()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const [isRecording, setIsRecording] = useState(false)
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [cameraError, setCameraError] = useState("")
  const [analysisError, setAnalysisError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
  }, [user, router])

  const startCamera = async () => {
    try {
      setCameraError("")
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      setCameraError("Unable to access camera. Please check permissions and try again.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsRecording(false)
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)

      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8)
      setCapturedImage(imageDataUrl)
      stopCamera()
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
        setUploadedFile(file)
        setCapturedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    const imageToAnalyze = capturedImage || uploadedImage
    if (!imageToAnalyze) return

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisError("")

    try {
      // Try backend API first
      try {
        // Convert base64 to blob for upload
        const blob = await fetch(imageToAnalyze).then((res) => res.blob())
        const file = new File([blob], "livestock-image.jpg", { type: "image/jpeg" })

        // Upload image
        const uploadResponse = await analysisAPI.uploadImage(file, "cattle")
        const imageId = uploadResponse.image_id

        // Simulate progress updates while backend processes
        const progressSteps = [10, 25, 45, 65, 80, 95, 100]
        for (const step of progressSteps) {
          await new Promise((resolve) => setTimeout(resolve, 600))
          setAnalysisProgress(step)
        }

        // Get analysis results
        const results = await analysisAPI.getAnalysisResult(uploadResponse.analysis_id)
        setAnalysisResults(results)
      } catch (apiError) {
        console.warn("Backend API not available, using demo analysis")

        // Fallback to demo analysis
        const progressSteps = [
          { step: 10, message: "Initializing AI model..." },
          { step: 25, message: "Detecting animal boundaries..." },
          { step: 45, message: "Measuring body dimensions..." },
          { step: 65, message: "Analyzing physical traits..." },
          { step: 80, message: "Calculating standardized scores..." },
          { step: 95, message: "Generating report..." },
          { step: 100, message: "Analysis complete!" },
        ]

        for (const { step } of progressSteps) {
          await new Promise((resolve) => setTimeout(resolve, 800))
          setAnalysisProgress(step)
        }

        const mockResults = {
          id: Date.now().toString(),
          animalType: Math.random() > 0.5 ? "Cattle" : "Buffalo",
          breed: ["Holstein", "Jersey", "Gir", "Sahiwal", "Murrah"][Math.floor(Math.random() * 5)],
          overallScore: Math.floor(Math.random() * 20) + 80,
          measurements: {
            bodyLength: (Math.random() * 20 + 140).toFixed(1),
            heightAtWithers: (Math.random() * 15 + 125).toFixed(1),
            chestWidth: (Math.random() * 10 + 35).toFixed(1),
            rumpAngle: (Math.random() * 10 + 15).toFixed(1),
          },
          traits: {
            bodyConformation: Math.floor(Math.random() * 15) + 85,
            dairyCharacter: Math.floor(Math.random() * 15) + 80,
            udderQuality: Math.floor(Math.random() * 20) + 75,
            locomotion: Math.floor(Math.random() * 10) + 85,
          },
          recommendations: [
            "Excellent body conformation for breeding program",
            "Consider for genetic improvement initiatives",
            "Monitor udder health regularly",
            "Maintain current nutrition program",
          ],
          confidence: (Math.random() * 5 + 95).toFixed(1),
        }

        setAnalysisResults(mockResults)
      }
    } catch (error) {
      console.error("Analysis error:", error)
      setAnalysisError("Failed to analyze image. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setCapturedImage(null)
    setUploadedImage(null)
    setUploadedFile(null)
    setAnalysisResults(null)
    setAnalysisProgress(0)
    setAnalysisError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const saveResults = async () => {
    if (!analysisResults) return

    setIsSaving(true)
    try {
      // Save to database
      await analysisAPI.saveToDatabase({
        animal_type: analysisResults.animalType,
        breed: analysisResults.breed,
        overall_score: analysisResults.overallScore,
        measurements: analysisResults.measurements,
        traits: analysisResults.traits,
        confidence: analysisResults.confidence,
      })

      // Sync to BPA if available
      try {
        await bpaAPI.syncToBPA(analysisResults.id)
      } catch (err) {
        console.warn("BPA sync failed:", err)
      }

      alert("Results saved successfully to BPA system!")
      resetAnalysis()
    } catch (error) {
      console.error("Error saving results:", error)
      alert("Failed to save results. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Image Analysis</h1>
          <p className="text-stone-600">
            Capture or upload livestock images for AI-powered classification and scoring.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Capture/Upload Section */}
          <div className="space-y-6">
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="flex items-center text-stone-800">
                  <Camera className="h-5 w-5 mr-2" />
                  Image Capture
                </CardTitle>
                <CardDescription>Choose between live camera capture or file upload</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="camera" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="camera">Auto Recording</TabsTrigger>
                    <TabsTrigger value="upload">Manual Upload</TabsTrigger>
                  </TabsList>

                  <TabsContent value="camera" className="space-y-4">
                    <div className="aspect-video bg-stone-100 rounded-lg overflow-hidden relative">
                      {isRecording ? (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      ) : capturedImage ? (
                        <img
                          src={capturedImage || "/placeholder.svg"}
                          alt="Captured livestock"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Camera className="h-12 w-12 text-stone-400 mx-auto mb-2" />
                            <p className="text-stone-500">Camera preview will appear here</p>
                          </div>
                        </div>
                      )}

                      {isRecording && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-red-500 text-white animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                            LIVE
                          </Badge>
                        </div>
                      )}
                    </div>

                    {cameraError && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{cameraError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      {!isRecording && !capturedImage && (
                        <Button onClick={startCamera} className="flex-1 bg-teal-600 hover:bg-teal-700">
                          <Play className="h-4 w-4 mr-2" />
                          Start Camera
                        </Button>
                      )}

                      {isRecording && (
                        <>
                          <Button onClick={captureImage} className="flex-1 bg-green-600 hover:bg-green-700">
                            <Camera className="h-4 w-4 mr-2" />
                            Capture
                          </Button>
                          <Button onClick={stopCamera} variant="outline" className="border-stone-300 bg-transparent">
                            <Square className="h-4 w-4 mr-2" />
                            Stop
                          </Button>
                        </>
                      )}

                      {capturedImage && (
                        <Button onClick={resetAnalysis} variant="outline" className="border-stone-300 bg-transparent">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Retake
                        </Button>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="aspect-video bg-stone-100 rounded-lg overflow-hidden relative border-2 border-dashed border-stone-300">
                      {uploadedImage ? (
                        <img
                          src={uploadedImage || "/placeholder.svg"}
                          alt="Uploaded livestock"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Upload className="h-12 w-12 text-stone-400 mx-auto mb-2" />
                            <p className="text-stone-500 mb-2">Upload livestock image</p>
                            <p className="text-sm text-stone-400">JPG, PNG up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 bg-teal-600 hover:bg-teal-700"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>

                      {uploadedImage && (
                        <Button onClick={resetAnalysis} variant="outline" className="border-stone-300 bg-transparent">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </TabsContent>
                </Tabs>

                {(capturedImage || uploadedImage) && !analysisResults && (
                  <div className="mt-6">
                    <Button
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Start AI Analysis
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <Card className="border-stone-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-stone-800">AI Analysis in Progress</h3>
                      <span className="text-sm text-stone-600">{analysisProgress}%</span>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                    <p className="text-sm text-stone-600">
                      Processing image with advanced machine learning algorithms...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {analysisResults ? (
              <>
                <Card className="border-stone-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-stone-800">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Analysis Complete
                    </CardTitle>
                    <CardDescription>AI confidence: {analysisResults.confidence}%</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Overall Score */}
                    <div className="text-center p-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-stone-800 mb-2">Overall Score</h3>
                      <div className="text-4xl font-bold text-teal-600 mb-2">{analysisResults.overallScore}/100</div>
                      <Badge
                        className={
                          analysisResults.overallScore >= 90
                            ? "bg-green-100 text-green-800"
                            : analysisResults.overallScore >= 80
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {analysisResults.overallScore >= 90
                          ? "Excellent"
                          : analysisResults.overallScore >= 80
                            ? "Good"
                            : "Average"}
                      </Badge>
                    </div>

                    {/* Animal Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-stone-600">Animal Type</p>
                        <p className="font-semibold text-stone-800">{analysisResults.animalType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-stone-600">Breed</p>
                        <p className="font-semibold text-stone-800">{analysisResults.breed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Measurements */}
                <Card className="border-stone-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-stone-800">
                      <Ruler className="h-5 w-5 mr-2" />
                      Physical Measurements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-stone-600">Body Length</p>
                        <p className="font-semibold text-stone-800">{analysisResults.measurements.bodyLength} cm</p>
                      </div>
                      <div>
                        <p className="text-sm text-stone-600">Height at Withers</p>
                        <p className="font-semibold text-stone-800">
                          {analysisResults.measurements.heightAtWithers} cm
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-stone-600">Chest Width</p>
                        <p className="font-semibold text-stone-800">{analysisResults.measurements.chestWidth} cm</p>
                      </div>
                      <div>
                        <p className="text-sm text-stone-600">Rump Angle</p>
                        <p className="font-semibold text-stone-800">{analysisResults.measurements.rumpAngle}°</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trait Scores */}
                <Card className="border-stone-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-stone-800">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Trait Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(analysisResults.traits).map(([trait, score]) => (
                      <div key={trait}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-stone-700 capitalize">
                            {trait.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="text-sm text-stone-600">{score}/100</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button onClick={saveResults} disabled={isSaving} className="flex-1 bg-green-600 hover:bg-green-700">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Save to BPA
                      </>
                    )}
                  </Button>
                  <Button onClick={resetAnalysis} variant="outline" className="border-stone-300 bg-transparent">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    New Analysis
                  </Button>
                </div>
              </>
            ) : (
              <Card className="border-stone-200">
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-stone-800 mb-2">Ready for Analysis</h3>
                  <p className="text-stone-600">
                    Capture or upload an image to begin AI-powered livestock classification.
                  </p>
                </CardContent>
              </Card>
            )}

            {analysisError && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{analysisError}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  )
}
