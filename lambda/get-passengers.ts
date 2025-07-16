import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {
  createSuccessResponse,
  createErrorResponse,
  getQueryParameter,
} from '../src/utils/lambdaUtil'
import { PassengerService } from '../src/services/passenger.service'
import { FlightRepository } from '../src/repositories/flight.repository'
import { FlightBookingRepository } from '../src/repositories/flightbooking.repository'
import { PassengerRepository } from '../src/repositories/passenger.repository'
import { getDynamoDBClient } from '../src/utils/dynamodb.client'
import { logger } from '../src/utils/logger'
import { get } from 'axios'

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
    logger.info('Processing request to get passengers for flight', {
      flightNumber: getQueryParameter(event, 'flightNumber'),
      departureDate: getQueryParameter(event, 'departureDate'),
      getConnecting: getQueryParameter(event, 'getConnecting'),
    })

    const flightNumber = getQueryParameter(event, 'flightNumber')
    const departureDate = getQueryParameter(event, 'departureDate')
    const getConnecting = getQueryParameter(event, 'getConnecting')

    const passengers = await passengerService.getPassengersForFlight(
      flightNumber,
      departureDate,
      getConnecting
    )

    return createSuccessResponse(passengers)
  } catch (error) {
    logger.error(
      'Error fetching passengers:',
      error instanceof Error ? error : new Error('Unknown error')
    )
    return createErrorResponse(
      error instanceof Error ? error : new Error('Unknown error')
    )
  }
}
