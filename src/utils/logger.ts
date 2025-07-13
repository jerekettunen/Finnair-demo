export const logger = {
  info: (message: string, data?: any) => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        message,
        data,
        requestId: process.env.AWS_REQUEST_ID || 'unknown',
      })
    )
  },
  error: (message: string, error?: Error) => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        error: error ? error.message : 'Unknown error',
        stack: error ? error.stack : 'No stack trace',
        requestId: process.env.AWS_REQUEST_ID || 'unknown',
      })
    )
  },
}
