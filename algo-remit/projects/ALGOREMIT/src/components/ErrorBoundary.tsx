import React, { ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Here you can log errors to a monitoring service
    console.error('Uncaught error:', error, errorInfo)
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  private getErrorMessage(error: Error | null): string {
    if (!error) return 'An unexpected error occurred. Please try again or contact support.'

    if (error.message.includes('Attempt to get default algod configuration')) {
      return 'Environment variables are missing or misconfigured. Create a .env file from .env.template and provide the required Algod and Indexer credentials.'
    }

    return error.message || 'An unexpected error occurred. Please try again or contact support.'
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-amber-100 flex items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="backdrop-blur-lg bg-white/90 p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-amber-200 animate-fadeInUp">
            <h1 className="text-4xl font-bold text-amber-800 mb-6">Something Went Wrong</h1>
            <p className="text-amber-700 text-lg mb-6 leading-relaxed">{this.getErrorMessage(this.state.error)}</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-3 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 transition-all duration-300 shadow-md hover:shadow-lg"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              <button
                className="px-6 py-3 rounded-xl bg-rose-100 text-rose-700 font-medium hover:bg-rose-200 transition-all duration-300 shadow-md hover:shadow-lg"
                onClick={() => (window.location.href = '/')}
              >
                Go Home
              </button>
            </div>
          </div>

          <style>
            {`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-fadeInUp {
                animation: fadeInUp 0.5s ease-out forwards;
              }
            `}
          </style>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
