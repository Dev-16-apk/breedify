// API Configuration and utilities for backend integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Helper function to make API requests with error handling
export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = typeof window !== "undefined" ? localStorage.getItem("breedify_token") : null

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        if (typeof window !== "undefined") {
          localStorage.removeItem("breedify_token")
          localStorage.removeItem("breedify_user")
          window.location.href = "/login"
        }
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      // Network error - backend is not available
      const backendError = new Error("Backend service unavailable")
      backendError.isNetworkError = true
      throw backendError
    }
    console.error("[v0] API Error:", error.message)
    throw error
  }
}

// Authentication APIs
export const authAPI = {
  login: async (emailOrPhone, password) => {
    return apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email_or_phone: emailOrPhone, password }),
    })
  },

  signup: async (email, password, name, role = "field_officer") => {
    return apiCall("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name, role }),
    })
  },

  logout: async () => {
    return apiCall("/auth/logout", {
      method: "POST",
    })
  },

  getCurrentUser: async () => {
    return apiCall("/auth/me", {
      method: "GET",
    })
  },
}

// Livestock Analysis APIs
export const analysisAPI = {
  uploadImage: async (imageFile, animalType) => {
    const formData = new FormData()
    formData.append("image", imageFile)
    formData.append("animal_type", animalType)

    const token = typeof window !== "undefined" ? localStorage.getItem("breedify_token") : null
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/analysis/upload`, {
      method: "POST",
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    return await response.json()
  },

  analyzeImage: async (imageId) => {
    return apiCall("/analysis/analyze", {
      method: "POST",
      body: JSON.stringify({ image_id: imageId }),
    })
  },

  getAnalysisResult: async (analysisId) => {
    return apiCall(`/analysis/${analysisId}`, {
      method: "GET",
    })
  },

  saveToDatabase: async (analysisData) => {
    return apiCall("/analysis/save", {
      method: "POST",
      body: JSON.stringify(analysisData),
    })
  },
}

// Records APIs
export const recordsAPI = {
  getRecords: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters)
    return apiCall(`/records?${queryParams}`, {
      method: "GET",
    })
  },

  getRecordById: async (recordId) => {
    return apiCall(`/records/${recordId}`, {
      method: "GET",
    })
  },

  createRecord: async (recordData) => {
    return apiCall("/records", {
      method: "POST",
      body: JSON.stringify(recordData),
    })
  },

  updateRecord: async (recordId, recordData) => {
    return apiCall(`/records/${recordId}`, {
      method: "PUT",
      body: JSON.stringify(recordData),
    })
  },

  deleteRecord: async (recordId) => {
    return apiCall(`/records/${recordId}`, {
      method: "DELETE",
    })
  },

  getAnalytics: async (startDate, endDate) => {
    return apiCall(`/records/analytics?start_date=${startDate}&end_date=${endDate}`, {
      method: "GET",
    })
  },
}

// Dashboard APIs
export const dashboardAPI = {
  getStats: async () => {
    return apiCall("/dashboard/stats", {
      method: "GET",
    })
  },

  getRecentAnalysis: async (limit = 5) => {
    return apiCall(`/dashboard/recent?limit=${limit}`, {
      method: "GET",
    })
  },

  getTrendData: async (days = 7) => {
    return apiCall(`/dashboard/trends?days=${days}`, {
      method: "GET",
    })
  },
}

// BPA Integration APIs
export const bpaAPI = {
  syncToBPA: async (recordId) => {
    return apiCall(`/bpa/sync/${recordId}`, {
      method: "POST",
    })
  },

  getBPAStatus: async (recordId) => {
    return apiCall(`/bpa/status/${recordId}`, {
      method: "GET",
    })
  },
}
