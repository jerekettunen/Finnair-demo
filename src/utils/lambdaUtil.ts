import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { ValidationError, BusinessError, NotFoundError } from './validation'
import { logger } from './logger'

export const createResponse = (
  statusCode: number,
  body: any,
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers,
    },
    body: JSON.stringify(body),
  }
}

export const createSuccessResponse = (data: any): APIGatewayProxyResult => {
  return createResponse(200, data)
}

export const createErrorResponse = (error: Error): APIGatewayProxyResult => {
  logger.error('Lambda error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
  })

  // Map error types to HTTP status codes
  let statusCode: number
  let errorResponse: any

  switch (error.name) {
    case 'ValidationError':
      statusCode = 400
      errorResponse = {
        error: 'Bad Request',
        message: error.message,
        type: 'ValidationError',
        ...((error as ValidationError).field && {
          field: (error as ValidationError).field,
        }),
      }
      break

    case 'BusinessError':
      statusCode = 400
      errorResponse = {
        error: 'Bad Request',
        message: error.message,
        type: 'BusinessError',
      }
      break

    case 'NotFoundError':
      statusCode = 404
      errorResponse = {
        error: 'Not Found',
        message: error.message,
        type: 'NotFoundError',
      }
      break

    default:
      statusCode = 500
      errorResponse = {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        type: 'SystemError',
      }
      break
  }

  return createResponse(statusCode, errorResponse)
}

export const getQueryParameter = (
  event: APIGatewayProxyEvent,
  paramName: string,
  required: boolean = true
): string => {
  const value = event.queryStringParameters?.[paramName]

  if (!value && required) {
    throw new ValidationError(
      `Missing required query parameter: ${paramName}`,
      paramName
    )
  }

  return value || ''
}

export const getPathParameter = (
  event: APIGatewayProxyEvent,
  paramName: string
): string => {
  const value = event.pathParameters?.[paramName]

  if (!value) {
    throw new ValidationError(
      `Missing required path parameter: ${paramName}`,
      paramName
    )
  }

  return value
}
