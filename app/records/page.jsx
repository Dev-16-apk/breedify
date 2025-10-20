"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "../../components/navigation"
import { useAuth } from "../../lib/auth"
import { recordsAPI } from "../../lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Search, Download, TrendingUp, BarChart3 } from "lucide-react"

const CustomLineChart = ({ data }) => {
  if (!data || data.length === 0)
    return <div className="h-80 flex items-center justify-center text-stone-500">No data available</div>

  const maxValue = Math.max(...data.map((d) => Math.max(d.cows || 0, d.buffaloes || 0)))
  const chartHeight = 250
  const chartWidth = 400
  const padding = 40

  const getY = (value) => chartHeight - padding - (value / maxValue) * (chartHeight - 2 * padding)
  const getX = (index) => padding + (index * (chartWidth - 2 * padding)) / (data.length - 1)

  const cowsPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.cows || 0)}`).join(" ")
  const buffalosPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.buffaloes || 0)}`).join(" ")

  return (
    <div className="w-full h-80 flex flex-col">
      <svg
        width="100%"
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="border border-stone-200 rounded-lg bg-white"
      >
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + (i * (chartHeight - 2 * padding)) / 4}
            x2={chartWidth - padding}
            y2={padding + (i * (chartHeight - 2 * padding)) / 4}
            stroke="#e7e5e4"
            strokeDasharray="3 3"
          />
        ))}

        {/* Cows line */}
        <path d={cowsPath} fill="none" stroke="#3b82f6" strokeWidth="3" />
        {data.map((d, i) => (
          <circle key={`cow-${i}`} cx={getX(i)} cy={getY(d.cows || 0)} r="4" fill="#3b82f6" />
        ))}

        {/* Buffaloes line */}
        <path d={buffalosPath} fill="none" stroke="#10b981" strokeWidth="3" />
        {data.map((d, i) => (
          <circle key={`buffalo-${i}`} cx={getX(i)} cy={getY(d.buffaloes || 0)} r="4" fill="#10b981" />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={`label-${i}`}
            x={getX(i)}
            y={chartHeight - 10}
            textAnchor="middle"
            className="text-xs fill-stone-600"
          >
            {d.date}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-blue-500 mr-2" />
          <span className="text-sm font-medium text-stone-700">Cows</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-emerald-500 mr-2" />
          <span className="text-sm font-medium text-stone-700">Buffaloes</span>
        </div>
      </div>
    </div>
  )
}

const CustomDonutChart = ({ data }) => {
  if (!data || data.length === 0)
    return <div className="h-80 flex items-center justify-center text-stone-500">No data available</div>

  const size = 240
  const strokeWidth = 40
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  let cumulativePercentage = 0

  return (
    <div className="w-full h-80 flex flex-col items-center justify-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f5f5f4" strokeWidth={strokeWidth} />
          {data.map((item, index) => {
            const strokeDasharray = `${(item.value / 100) * circumference} ${circumference}`
            const strokeDashoffset = (-cumulativePercentage * circumference) / 100
            cumulativePercentage += item.value

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-stone-800">100%</div>
            <div className="text-sm text-stone-600">Total</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-medium text-stone-700">
              {entry.name}: {entry.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RecordsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterBreed, setFilterBreed] = useState("all")

  const [records, setRecords] = useState([])
  const [dailyRecordings, setDailyRecordings] = useState([])
  const [ratioData, setRatioData] = useState([])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchRecords = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch records from database
        const recordsData = await recordsAPI.getRecords()
        setRecords(recordsData)

        // Fetch analytics data
        const endDate = new Date().toISOString().split("T")[0]
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        const analyticsData = await recordsAPI.getAnalytics(startDate, endDate)

        setDailyRecordings(analyticsData.daily_recordings || [])
        setRatioData(analyticsData.ratio_data || [])
      } catch (err) {
        console.warn("Backend API not available, using demo data")
        setError("Using demo data - backend connection unavailable")

        // Fallback to demo data
        setRecords([
          {
            id: 1,
            animal: "Holstein Cow #HC-001",
            type: "Cattle",
            breed: "Holstein",
            score: 92,
            date: "2025-01-14",
            location: "Farm A",
            status: "excellent",
          },
          {
            id: 2,
            animal: "Jersey Bull #JB-045",
            type: "Cattle",
            breed: "Jersey",
            score: 88,
            date: "2025-01-14",
            location: "Farm B",
            status: "good",
          },
          {
            id: 3,
            animal: "Buffalo #BF-012",
            type: "Buffalo",
            breed: "Murrah",
            score: 78,
            date: "2025-01-13",
            location: "Farm C",
            status: "average",
          },
          {
            id: 4,
            animal: "Gir Cow #GC-023",
            type: "Cattle",
            breed: "Gir",
            score: 85,
            date: "2025-01-13",
            location: "Farm A",
            status: "good",
          },
          {
            id: 5,
            animal: "Sahiwal Bull #SB-008",
            type: "Cattle",
            breed: "Sahiwal",
            score: 95,
            date: "2025-01-12",
            location: "Farm D",
            status: "excellent",
          },
        ])

        setDailyRecordings([
          { date: "Jan 8", cows: 15, buffaloes: 8 },
          { date: "Jan 9", cows: 18, buffaloes: 12 },
          { date: "Jan 10", cows: 12, buffaloes: 6 },
          { date: "Jan 11", cows: 22, buffaloes: 15 },
          { date: "Jan 12", cows: 25, buffaloes: 18 },
          { date: "Jan 13", cows: 20, buffaloes: 14 },
          { date: "Jan 14", cows: 28, buffaloes: 16 },
        ])

        setRatioData([
          { name: "Cows", value: 65, color: "#3b82f6" },
          { name: "Buffaloes", value: 35, color: "#10b981" },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecords()
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.animal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.breed.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || record.type.toLowerCase() === filterType.toLowerCase()
    const matchesBreed = filterBreed === "all" || record.breed.toLowerCase() === filterBreed.toLowerCase()

    return matchesSearch && matchesType && matchesBreed
  })

  const getScoreBadge = (score) => {
    if (score >= 90) return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Excellent</Badge>
    if (score >= 80) return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
    if (score >= 70) return <Badge className="bg-teal-100 text-teal-800 border-teal-200">Average</Badge>
    return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Improvement</Badge>
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Records & Analytics</h1>
          <p className="text-stone-600">Comprehensive livestock classification records and insights</p>
          {error && <p className="text-sm text-amber-600 mt-2">{error}</p>}
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Recordings Chart */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-stone-800 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Daily Recordings Trend
              </CardTitle>
              <CardDescription>Number of cows and buffaloes recorded each day</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomLineChart data={dailyRecordings} />
            </CardContent>
          </Card>

          {/* Cow vs Buffalo Ratio */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-stone-800 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-emerald-600" />
                Cow vs Buffalo Ratio
              </CardTitle>
              <CardDescription>Distribution of recorded livestock types</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomDonutChart data={ratioData} />
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-stone-200 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                  <Input
                    placeholder="Search by animal ID, breed, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-stone-300"
                  />
                </div>
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-40 border-stone-300">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cattle">Cattle</SelectItem>
                  <SelectItem value="buffalo">Buffalo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBreed} onValueChange={setFilterBreed}>
                <SelectTrigger className="w-full sm:w-40 border-stone-300">
                  <SelectValue placeholder="Breed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Breeds</SelectItem>
                  <SelectItem value="holstein">Holstein</SelectItem>
                  <SelectItem value="jersey">Jersey</SelectItem>
                  <SelectItem value="gir">Gir</SelectItem>
                  <SelectItem value="sahiwal">Sahiwal</SelectItem>
                  <SelectItem value="murrah">Murrah</SelectItem>
                  <SelectItem value="nili-ravi">Nili-Ravi</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-stone-800">Classification Records</CardTitle>
            <CardDescription>
              Showing {filteredRecords.length} of {records.length} records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-semibold text-stone-800">{record.animal}</h4>
                        <p className="text-sm text-stone-600">
                          {record.breed} • {record.location} • {record.date}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-stone-300 text-stone-700">
                        {record.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-bold text-lg text-stone-800">{record.score}/100</p>
                      <p className="text-sm text-stone-600">Classification Score</p>
                    </div>
                    {getScoreBadge(record.score)}
                  </div>
                </div>
              ))}
            </div>

            {filteredRecords.length === 0 && (
              <div className="text-center py-8">
                <p className="text-stone-500">No records found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
