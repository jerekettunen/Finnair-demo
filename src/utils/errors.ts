export { ValidationError, NotFoundError } from './validation'

// HTTP status code mapping
export const getHttpStatusCode = (error: Error): number => {
  switch (error.name) {
    case 'ValidationError':
      return 400
    case 'BusinessError':
      return 400
    case 'NotFoundError':
      return 404
    default:
      return 500
  }
}

// Error response formatter for API Gateway
export const formatErrorResponse = (error: Error) => {
  const statusCode = getHttpStatusCode(error)

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      error: {
        message: error.message,
        type: error.name,
        ...(error.name === 'ValidationError' &&
          'field' in error && { field: (error as any).field }),
      },
    }),
  }
}
