// Global error types
export interface ApiError {
  message: string
  status?: number
  code?: string
  field?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: ApiError[]
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorListeners: ((error: ApiError) => void)[] = []

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Add error listener for components to subscribe to global errors
  addErrorListener(listener: (error: ApiError) => void) {
    this.errorListeners.push(listener)
  }

  // Remove error listener
  removeErrorListener(listener: (error: ApiError) => void) {
    this.errorListeners = this.errorListeners.filter(l => l !== listener)
  }

  // Handle API errors
  handleApiError(error: any): ApiError {
    let apiError: ApiError

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      apiError = {
        message: data?.message || this.getDefaultErrorMessage(status),
        status,
        code: data?.code,
        field: data?.field
      }
    } else if (error.request) {
      // Network error
      apiError = {
        message: 'Network error. Please check your internet connection.',
        status: 0,
        code: 'NETWORK_ERROR'
      }
    } else {
      // Other error
      apiError = {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
      }
    }

    // Notify all listeners
    this.notifyErrorListeners(apiError)

    return apiError
  }

  // Handle form validation errors
  handleValidationErrors(errors: any): Record<string, string> {
    const formErrors: Record<string, string> = {}

    if (Array.isArray(errors)) {
      errors.forEach((error: any) => {
        if (error.field && error.message) {
          formErrors[error.field] = error.message
        }
      })
    } else if (typeof errors === 'object') {
      Object.keys(errors).forEach(key => {
        formErrors[key] = errors[key]
      })
    }

    return formErrors
  }

  // Get default error message based on status code
  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.'
      case 401:
        return 'You are not authorized. Please log in again.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 409:
        return 'This resource already exists or conflicts with existing data.'
      case 422:
        return 'The provided data is invalid.'
      case 429:
        return 'Too many requests. Please try again later.'
      case 500:
        return 'Internal server error. Please try again later.'
      case 502:
        return 'Bad gateway. The server is temporarily unavailable.'
      case 503:
        return 'Service unavailable. Please try again later.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  // Notify all error listeners
  private notifyErrorListeners(error: ApiError) {
    this.errorListeners.forEach(listener => {
      try {
        listener(error)
      } catch (e) {
        console.error('Error in error listener:', e)
      }
    })
  }

  // Log error (can be extended to send to external service)
  logError(error: any, context?: string) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        message: error.message,
        stack: error.stack,
        ...error
      }
    }

    console.error('Error logged:', errorInfo)

    // In production, send to error tracking service
    // this.sendToErrorService(errorInfo)
  }

  // Handle authentication errors
  handleAuthError() {
    // Clear stored auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Redirect to login page
      window.location.href = '/auth/login'
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Utility function to wrap API calls with error handling
export function withErrorHandling<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  return apiCall().catch((error) => {
    const apiError = errorHandler.handleApiError(error)
    
    // Handle auth errors
    if (apiError.status === 401) {
      errorHandler.handleAuthError()
    }
    
    throw apiError
  })
}

// Create standardized API response
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  errors?: ApiError[]
): ApiResponse<T> {
  return {
    success,
    data,
    message,
    errors
  }
}