"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "../../components/navigation"
import { useAuth } from "../../lib/auth"
import { dashboardAPI, recordsAPI } from "../../lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Camera, FileText, TrendingUp, Users, Award, Calendar, ArrowRight, Activity, Target, Zap } from "lucide-react"

const CustomBarChart = ({ data }) => {
  const maxValue = Math.max(...data.map((d) => Math.max(d.cattle, d.buffalo)))

  return (
    <div className="h-[300px] flex items-end justify-between px-4 py-4 bg-white">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1 mx-1">
          <div className="flex items-end space-x-1 mb-2 h-48">
            <div
              className="bg-blue-500 rounded-t-sm min-w-[16px] flex items-end justify-center text-xs text-white font-medium"
              style={{ height: `${(item.cattle / maxValue) * 100}%` }}
            >
              {item.cattle > 5 && item.cattle}
            </div>
            <div
              className="bg-emerald-500 rounded-t-sm min-w-[16px] flex items-end justify-center text-xs text-white font-medium"
              style={{ height: `${(item.buffalo / maxValue) * 100}%` }}
            >
              {item.buffalo > 5 && item.buffalo}
            </div>
          </div>
          <span className="text-xs text-stone-600 font-medium">{item.day}</span>
        </div>
      ))}
      <div className="absolute bottom-16 right-4 flex items-center space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
          <span>Cattle</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-emerald-500 rounded mr-1"></div>
          <span>Buffalo</span>
        </div>
      </div>
    </div>
  )
}

const CustomDonutChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0

  return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="relative">
        <svg width="240" height="240" className="transform -rotate-90">
          <circle cx="120" cy="120" r="80" fill="none" stroke="#f3f4f6" strokeWidth="40" />
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            const strokeDasharray = `${percentage * 5.03} 502`
            const strokeDashoffset = -cumulativePercentage * 5.03
            cumulativePercentage += percentage

            return (
              <circle
                key={index}
                cx="120"
                cy="120"
                r="80"
                fill="none"
                stroke={item.color}
                strokeWidth="40"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-stone-800">{total}%</div>
            <div className="text-sm text-stone-600">Total</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [stats, setStats] = useState(null)
  const [recentAnalyses, setRecentAnalyses] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [breedDistribution, setBreedDistribution] = useState([])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch stats
        const statsData = await dashboardAPI.getStats()
        setStats(statsData)

        // Fetch recent analyses
        const recentData = await dashboardAPI.getRecentAnalysis(5)
        setRecentAnalyses(recentData)

        // Fetch trend data
        const trendData = await dashboardAPI.getTrendData(7)
        setWeeklyData(trendData)

        // Fetch analytics for breed distribution
        const analyticsData = await recordsAPI.getAnalytics(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          new Date().toISOString().split("T")[0],
        )
        setBreedDistribution(analyticsData.breed_distribution || [])
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Using demo data.")

        setStats({
          total_analyses: 1247,
          this_week: 156,
          avg_score: 87.5,
          bpa_sync: 98,
        })
        setRecentAnalyses([
          { id: 1, animal: "Holstein Cow #HC-001", score: 92, date: "2025-01-15", status: "excellent" },
          { id: 2, animal: "Jersey Bull #JB-045", score: 88, date: "2025-01-15", status: "good" },
          { id: 3, animal: "Gir Cow #GC-023", score: 85, date: "2025-01-14", status: "good" },
          { id: 4, animal: "Buffalo #BF-012", score: 78, date: "2025-01-14", status: "average" },
          { id: 5, animal: "Sahiwal Bull #SB-008", score: 95, date: "2025-01-13", status: "excellent" },
        ])
        setWeeklyData([
          { day: "Mon", cattle: 12, buffalo: 8 },
          { day: "Tue", cattle: 15, buffalo: 10 },
          { day: "Wed", cattle: 8, buffalo: 6 },
          { day: "Thu", cattle: 18, buffalo: 12 },
          { day: "Fri", cattle: 22, buffalo: 15 },
          { day: "Sat", cattle: 25, buffalo: 18 },
          { day: "Sun", cattle: 20, buffalo: 14 },
        ])
        setBreedDistribution([
          { name: "Holstein", value: 35, color: "#3b82f6" },
          { name: "Jersey", value: 25, color: "#10b981" },
          { name: "Gir", value: 20, color: "#f59e0b" },
          { name: "Sahiwal", value: 12, color: "#ef4444" },
          { name: "Others", value: 8, color: "#8b5cf6" },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  const getScoreBadge = (score) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>
    if (score >= 80) return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Average</Badge>
    return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Improvement</Badge>
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Welcome back, {user?.name || "User"}!</h1>
          <p className="text-stone-600">Here's your livestock classification overview for today.</p>
          {error && <p className="text-sm text-amber-600 mt-2">{error}</p>}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-stone-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">Total Analyses</p>
                  <p className="text-3xl font-bold text-stone-800">{stats?.total_analyses || 0}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">This Week</p>
                  <p className="text-3xl font-bold text-stone-800">{stats?.this_week || 0}</p>
                  <p className="text-sm text-blue-600 flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {stats?.this_week ? Math.round(stats.this_week / 7) : 0} per day average
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">Avg Score</p>
                  <p className="text-3xl font-bold text-stone-800">{stats?.avg_score?.toFixed(1) || 0}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <Target className="h-4 w-4 mr-1" />
                    +2.3 points
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">BPA Sync</p>
                  <p className="text-3xl font-bold text-stone-800">{stats?.bpa_sync || 0}%</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <Zap className="h-4 w-4 mr-1" />
                    All systems active
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Analysis Chart */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-stone-800">Weekly Analysis Trends</CardTitle>
              <CardDescription>Cattle and buffalo analyses over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyData.length > 0 ? (
                <CustomBarChart data={weeklyData} />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-stone-500">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Breed Distribution */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-stone-800">Breed Distribution</CardTitle>
              <CardDescription>Analysis breakdown by breed type</CardDescription>
            </CardHeader>
            <CardContent>
              {breedDistribution.length > 0 ? (
                <>
                  <CustomDonutChart data={breedDistribution} />
                  <div className="flex flex-wrap gap-4 mt-4">
                    {breedDistribution.map((entry, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-stone-600">
                          {entry.name} ({entry.value}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-stone-500">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Analyses and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Analyses */}
          <Card className="lg:col-span-2 border-stone-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-stone-800">Recent Analyses</CardTitle>
                <CardDescription>Latest livestock classification results</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/records")}
                className="border-stone-300 text-stone-700 hover:bg-stone-50"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAnalyses.length > 0 ? (
                  recentAnalyses.map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-stone-800">{analysis.animal}</h4>
                        <p className="text-sm text-stone-600">{analysis.date}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-semibold text-stone-800">{analysis.score}/100</p>
                          <Progress value={analysis.score} className="w-20 h-2" />
                        </div>
                        {getScoreBadge(analysis.score)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-500 text-center py-4">No recent analyses</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="text-stone-800">Quick Actions</CardTitle>
              <CardDescription>Start your analysis workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full justify-start bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => router.push("/analysis")}
              >
                <Camera className="h-4 w-4 mr-2" />
                New Analysis
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start border-stone-300 text-stone-700 hover:bg-stone-50 bg-transparent"
                onClick={() => router.push("/records")}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Records
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start border-stone-300 text-stone-700 hover:bg-stone-50 bg-transparent"
                onClick={() => router.push("/settings")}
              >
                <Users className="h-4 w-4 mr-2" />
                BPA Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
