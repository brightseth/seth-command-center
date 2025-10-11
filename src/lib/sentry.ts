import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,

      // Capture 10% of transactions for performance monitoring
      tracesSampleRate: 0.1,

      // Capture 100% of the errors
      beforeSend(event) {
        // Filter out non-critical errors in development
        if (process.env.NODE_ENV === 'development') {
          return null
        }
        return event
      },

      // Sentry v8 integrations are automatically added
      // BrowserTracing is now built-in
    })
  }
}

// Helper for API error tracking
export function captureApiError(error: Error, context: Record<string, any> = {}) {
  Sentry.withScope((scope) => {
    scope.setTag('errorType', 'api')
    scope.setContext('apiContext', context)
    Sentry.captureException(error)
  })
}

// Helper for ritual execution tracking
export function captureRitualEvent(ritualId: string, status: 'started' | 'completed' | 'failed', metadata: Record<string, any> = {}) {
  Sentry.addBreadcrumb({
    category: 'ritual',
    message: `Ritual ${ritualId} ${status}`,
    level: status === 'failed' ? 'error' : 'info',
    data: metadata
  })
}