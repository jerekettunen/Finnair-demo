import { PassengerService } from '../services/passenger.service'
import { FlightRepository } from '../repositories/flight.repository'
import { FlightBookingRepository } from '../repositories/flightbooking.repository'
import { PassengerRepository } from '../repositories/passenger.repository'
import { getDynamoDBClient } from '../utils/dynamodb.client'
import { logger } from '../utils/logger'

export class PassengerController {
  private passengerService: PassengerService

  constructor() {
    const client = getDynamoDBClient()
    const flightRepo = new FlightRepository(client)
    const flightBookingRepo = new FlightBookingRepository(client)
    const passengerRepo = new PassengerRepository(client)

    this.passengerService = new PassengerService(
      flightRepo,
      flightBookingRepo,
      passengerRepo
    )
  }

  async getPassengersForFlight(flightNumber: string, departureDate: string) {
    console.log(
      `\n🔍 GET /passengers?flightNumber=${flightNumber}&departureDate=${departureDate}`
    )
    console.log('='.repeat(80))

    try {
      const passengers = await this.passengerService.getPassengersForFlight(
        flightNumber,
        departureDate
      )

      console.log('SUCCESS - Response:')
      console.log(JSON.stringify(passengers, null, 2))
      console.log(
        `Found ${passengers.length} passengers on flight ${flightNumber}`
      )

      // Show passenger breakdown
      if (passengers.length > 0) {
        const bookingGroups = passengers.reduce((acc, p) => {
          acc[p.bookingId] = (acc[p.bookingId] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        console.log('Passenger breakdown by booking:')
        Object.entries(bookingGroups).forEach(([bookingId, count]) => {
          console.log(`   ${bookingId}: ${count} passenger(s)`)
        })
      }

      return passengers
    } catch (error) {
      console.error('ERROR:', error instanceof Error ? error.message : error)
      throw error
    }
  }

  async getPassengerById(passengerId: string) {
    console.log(`\n GET /passengers/${passengerId}`)
    console.log('='.repeat(80))

    try {
      const passenger = await this.passengerService.getPassengerDetails(
        passengerId
      )

      console.log('SUCCESS - Response:')
      console.log(JSON.stringify(passenger, null, 2))
      console.log(`📊 Passenger has ${passenger.flights.length} flight(s)`)

      // Show flight details
      if (passenger.flights.length > 0) {
        console.log('✈️  Flight itinerary:')
        passenger.flights.forEach((flight, index) => {
          console.log(
            `   ${index + 1}. ${flight.flightNumber}: ${
              flight.departureAirport
            }→${flight.arrivalAirport} on ${flight.departureDate}`
          )
        })
      }

      return passenger
    } catch (error) {
      console.error('ERROR:', error instanceof Error ? error.message : error)
      throw error
    }
  }
}
