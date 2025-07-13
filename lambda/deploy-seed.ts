import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { MockDataSeeder } from '../src/utils/mock-data-seeder'
import { logger } from '../src/utils/logger'

export const handler = async (
  event?: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('🌱 Starting AWS data seeding...', {
      requestId: event?.requestContext?.requestId || 'direct-invoke',
      timestamp: new Date().toISOString(),
    })

    // Create seeder and seed data
    const seeder = new MockDataSeeder()
    await seeder.seedData()

    logger.info('✅ AWS data seeding completed successfully')

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({
        message: 'Mock data seeded successfully in AWS',
        timestamp: new Date().toISOString(),
        summary: {
          flights: 8,
          passengers: 12,
          bookings: 7,
          relationships: 'All flight-booking relationships created',
        },
        testEndpoints: {
          getPassengers:
            '/passengers?flightNumber=AY123&departureDate=2024-01-15',
          getPassengerById: '/passengers/PAX001',
          getPassengerMultiFlight: '/passengers/PAX002',
        },
      }),
    }
  } catch (error) {
    logger.error(
      '❌ AWS data seeding failed:',
      error instanceof Error ? error : new Error('Unknown error')
    )

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to seed data in AWS',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
    }
  }
}
