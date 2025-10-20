// Centralized error handling utilities

export class APIError extends Error {
  constructor(message, status, originalError) {
    super(message)
    this.name = "APIError"
    this.status = status
    this.originalError = originalError
  }
}

export function getErrorMessage(error) {
  if (error instanceof APIError) {
    if (error.status === 401) {
      return "Your session has expired. Please log in again."
    }
    if (error.status === 403) {
      return "You don't have permission to perform this action."
    }
    if (error.status === 404) {
      return "The requested resource was not found."
    }
    if (error.status === 500) {
      return "Server error. Please try again later."
    }
    if (error.status === 503) {
      return "Service temporarily unavailable. Please try again later."
    }
    return error.message || "An error occurred. Please try again."
  }

  if (error instanceof TypeError) {
    if (error.message.includes("fetch")) {
      return "Network error. Please check your connection and try again."
    }
    return "An unexpected error occurred."
  }

  return error?.message || "An unexpected error occurred. Please try again."
}

export function isNetworkError(error) {
  return error instanceof TypeError && error.message.includes("fetch")
}

export function isAuthError(error) {
  return error instanceof APIError && (error.status === 401 || error.status === 403)
}

export function isServerError(error) {
  return error instanceof APIError && error.status >= 500
}

export function isClientError(error) {
  return error instanceof APIError && error.status >= 400 && error.status < 500
}

// Retry logic with exponential backoff
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (isClientError(error) && error.status !== 429) {
        throw error
      }

      // Don't retry on auth errors
      if (isAuthError(error)) {
        throw error
      }

      // Wait before retrying with exponential backoff
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}
