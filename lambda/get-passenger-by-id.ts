import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {
  createSuccessResponse,
  createErrorResponse,
  getPathParameter,
} from '../src/utils/lambdaUtil'
import { PassengerService } from '../src/services/passenger.service'
import { FlightRepository } from '../src/repositories/flight.repository'
import { FlightBookingRepository } from '../src/repositories/flightbooking.repository'
import { PassengerRepository } from '../src/repositories/passenger.repository'
import { getDynamoDBClient } from '../src/utils/dynamodb.client'
import { logger } from '../src/utils/logger'

// Initialize repositories and services
const dynamoClient = getDynamoDBClient()
const flightRepository = new FlightRepository(dynamoClient)
const flightBookingRepository = new FlightBookingRepository(dynamoClient)
const passengerRepository = new PassengerRepository(dynamoClient)

const passengerService = new PassengerService(
  flightRepository,
  flightBookingRepository,
  passengerRepository
)
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Processing request to get passenger details by ID', {
      requestId: event.requestContext.requestId,
      passengerId: event.pathParameters?.passengerId,
    })
    const passengerId = getPathParameter(event, 'passengerId')

    const passenger = await passengerService.getPassengerDetails(passengerId)

    return createSuccessResponse(passenger)
  } catch (error) {
    logger.error(
      'Error fetching passenger details:',
      error instanceof Error ? error : new Error('Unknown error')
    )
    return createErrorResponse(
      error instanceof Error ? error : new Error('Unknown error')
    )
  }
}
