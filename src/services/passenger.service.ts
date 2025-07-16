import { components } from '../../types/openapi'
import { FlightRepository } from '../repositories/flight.repository'
import { FlightBookingRepository } from '../repositories/flightbooking.repository'
import { PassengerRepository } from '../repositories/passenger.repository'
import {
  validateFlightNumber,
  validatePassengerId,
  validateDepartureDate,
  NotFoundError,
  BusinessError,
} from '../utils/validation'
import { logger } from '../utils/logger'

type PassengerSummary = components['schemas']['PassengerSummary']
type PassengerDetails = components['schemas']['PassengerDetails']
type FlightInfo = components['schemas']['FlightInfo']

export class PassengerService {
  constructor(
    private flightRepository: FlightRepository,
    private flightBookingRepository: FlightBookingRepository,
    private passengerRepository: PassengerRepository
  ) {}

  async getPassengersForFlight(
    flightNumber: string,
    departureDate: string,
    getConnecting?: string
  ): Promise<PassengerSummary[]> {
    validateFlightNumber(flightNumber)
    validateDepartureDate(departureDate)

    const flight = await this.flightRepository.findByFlightNumberAndDate(
      flightNumber,
      departureDate
    )
    if (!flight) {
      throw new NotFoundError(
        `Flight ${flightNumber} on ${departureDate} not found`
      )
    }

    let bookingIds =
      await this.flightBookingRepository.findBookingIdsByFlightId(
        flight.flightId
      )

    const filteredBookingIds = []

    if (getConnecting === 'true') {
      for (const bookingId of bookingIds) {
        const flightInBooking =
          await this.flightBookingRepository.findFlightsByBookingId(bookingId)
        if (flightInBooking.length > 1) {
          // If there are multiple flights in the booking, we consider it a connecting flight
          filteredBookingIds.push(bookingId)
        }
      }
      bookingIds = filteredBookingIds
    }

    if (bookingIds.length === 0) {
      logger.info(`No bookings found for flight ${flight.flightId}`)
      return [] // Return empty array if no bookings
    }

    const passengerRecords = await this.passengerRepository.findByBookingIds(
      bookingIds
    )

    const passengers: PassengerSummary[] = passengerRecords.map((record) => ({
      passengerId: record.passengerId,
      firstName: record.firstName,
      lastName: record.lastName,
      bookingId: record.bookingId,
    }))

    return passengers
  }

  async getPassengerDetails(passengerId: string): Promise<PassengerDetails> {
    validatePassengerId(passengerId)

    const passenger = await this.passengerRepository.findById(passengerId)
    if (!passenger) {
      throw new NotFoundError(`Passenger with ID ${passengerId} not found`)
    }

    const flightBookings =
      await this.flightBookingRepository.findFlightsByBookingId(
        passenger.bookingId
      )

    const flightPromises = flightBookings.map((booking) =>
      this.flightRepository.findById(booking.flightId)
    )
    const flights = await Promise.all(flightPromises)
    const validFlights = flights.filter((flight) => flight !== null)

    const flightsInfo: FlightInfo[] = validFlights.map((flight) => ({
      flightNumber: flight.flightNumber,
      departureAirport: flight.departureAirport,
      arrivalAirport: flight.arrivalAirport,
      departureDate: flight.departureDate,
      arrivalDate: flight.arrivalDate,
      bookings: [], //empty as we do not return this
    }))

    const passengerDetails: PassengerDetails = {
      passengerId: passenger.passengerId,
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      email: passenger.email,
      bookingId: passenger.bookingId,
      flights: flightsInfo,
    }

    return passengerDetails
  }
}
