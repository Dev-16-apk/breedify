"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import { User, Bell, Database, Shield, Save, LogOut } from "lucide-react"

export default function SettingsPage() {
  const [currentPage, setCurrentPage] = useState("settings")
  const { user, logout } = useAuth()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const { language, setLanguage } = useLanguage()
  const [inactivityTimeout, setInactivityTimeout] = useState("30min")

  const [notificationPreferencesEnabled, setNotificationPreferencesEnabled] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [analysisCompletion, setAnalysisCompletion] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)
  const [systemMaintenance, setSystemMaintenance] = useState(true)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem("breedify_language", language)
    // Language switching logic would go here
  }, [language])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleNotificationPreferencesChange = (enabled) => {
    setNotificationPreferencesEnabled(enabled)
    if (enabled) {
      // When enabled, user can control individual options
      setEmailNotifications(false)
      setAnalysisCompletion(false)
      setWeeklyReports(false)
      setSystemMaintenance(false)
    } else {
      // When disabled, all options are enabled by default
      setEmailNotifications(true)
      setAnalysisCompletion(true)
      setWeeklyReports(true)
      setSystemMaintenance(true)
    }
  }

  const handleInactivityTimeoutChange = (value) => {
    setInactivityTimeout(value)
    const timeoutMap = {
      "15min": 15,
      "30min": 30,
      "1hour": 60,
      "4hours": 240,
    }
    localStorage.setItem("breedify_inactivity_timeout", timeoutMap[value])
  }

  if (currentPage !== "settings") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="lg:pl-64">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-balance">{getTranslation("settingsTitle", language)}</h1>
              <p className="text-muted-foreground text-pretty">{getTranslation("settingsDescription", language)}</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                {getTranslation("profile", language)}
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                {getTranslation("notifications", language)}
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2">
                <Database className="h-4 w-4" />
                {getTranslation("system", language)}
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                {getTranslation("security", language)}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{getTranslation("profileInformation", language)}</CardTitle>
                  <CardDescription>{getTranslation("updatePersonalInfo", language)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{getTranslation("fullNameLabel", language)}</Label>
                      <Input id="name" defaultValue={user?.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{getTranslation("emailAddress", language)}</Label>
                      <Input id="email" type="email" defaultValue={user?.email} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">{getTranslation("role", language)}</Label>
                      <Select defaultValue={user?.role}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="field_officer">Field Officer</SelectItem>
                          <SelectItem value="veterinarian">Veterinarian</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">{getTranslation("district", language)}</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="district1">District 1</SelectItem>
                          <SelectItem value="district2">District 2</SelectItem>
                          <SelectItem value="district3">District 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    {getTranslation("saveChanges", language)}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{getTranslation("notificationPreferences", language)}</CardTitle>
                  <CardDescription>{getTranslation("configureNotifications", language)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="space-y-0.5">
                      <Label className="font-semibold">{getTranslation("notificationPreferences", language)}</Label>
                      <p className="text-sm text-muted-foreground">
                        {notificationPreferencesEnabled
                          ? getTranslation("configureNotifications", language)
                          : "All notifications enabled by default"}
                      </p>
                    </div>
                    <Switch
                      checked={notificationPreferencesEnabled}
                      onCheckedChange={handleNotificationPreferencesChange}
                    />
                  </div>

                  <div
                    className="space-y-4"
                    style={{
                      opacity: notificationPreferencesEnabled ? 1 : 0.5,
                      pointerEvents: notificationPreferencesEnabled ? "auto" : "none",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{getTranslation("emailNotifications", language)}</Label>
                        <p className="text-sm text-muted-foreground">Receive email alerts for important updates</p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                        disabled={!notificationPreferencesEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{getTranslation("analysisCompletion", language)}</Label>
                        <p className="text-sm text-muted-foreground">Get notified when image analysis is complete</p>
                      </div>
                      <Switch
                        checked={analysisCompletion}
                        onCheckedChange={setAnalysisCompletion}
                        disabled={!notificationPreferencesEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{getTranslation("weeklyReports", language)}</Label>
                        <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
                      </div>
                      <Switch
                        checked={weeklyReports}
                        onCheckedChange={setWeeklyReports}
                        disabled={!notificationPreferencesEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{getTranslation("systemMaintenance", language)}</Label>
                        <p className="text-sm text-muted-foreground">Alerts about system updates and maintenance</p>
                      </div>
                      <Switch
                        checked={systemMaintenance}
                        onCheckedChange={setSystemMaintenance}
                        disabled={!notificationPreferencesEnabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{getTranslation("systemConfiguration", language)}</CardTitle>
                  <CardDescription>Configure system behavior and data management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{getTranslation("autoSaveRecords", language)}</Label>
                      <p className="text-sm text-muted-foreground">Automatically save analysis results to database</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{getTranslation("bpaIntegration", language)}</Label>
                      <p className="text-sm text-muted-foreground">
                        Sync records with Breed Performance Analysis system
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>{getTranslation("imageQualityThreshold", language)}</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Faster processing)</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="high">High (Better accuracy)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{getTranslation("dataRetentionPeriod", language)}</Label>
                    <Select defaultValue="2years">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="2years">2 Years</SelectItem>
                        <SelectItem value="5years">5 Years</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{getTranslation("appearance", language)}</CardTitle>
                  <CardDescription>Customize the look and feel of the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{getTranslation("darkMode", language)}</Label>
                      <p className="text-sm text-muted-foreground">Switch to dark theme for better visibility</p>
                    </div>
                    <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                  </div>

                  <div className="space-y-2">
                    <Label>{getTranslation("language", language)}</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{getTranslation("securitySettings", language)}</CardTitle>
                  <CardDescription>Manage your account security and access controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>{getTranslation("changePassword", language)}</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <Input type="password" placeholder="Current password" />
                        <Input type="password" placeholder="New password" />
                      </div>
                      <Button className="mt-2 bg-transparent" variant="outline">
                        Update Password
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{getTranslation("twoFactorAuth", language)}</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{getTranslation("sessionTimeout", language)}</Label>
                      <p className="text-sm text-muted-foreground">Automatically log out after period of inactivity</p>
                    </div>
                    <Select value={inactivityTimeout} onValueChange={handleInactivityTimeoutChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15min">15 minutes</SelectItem>
                        <SelectItem value="30min">30 minutes</SelectItem>
                        <SelectItem value="1hour">1 hour</SelectItem>
                        <SelectItem value="4hours">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{getTranslation("signOut", language)}</Label>
                        <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 bg-transparent"
                      >
                        <LogOut className="h-4 w-4" />
                        {getTranslation("signOut", language)}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
