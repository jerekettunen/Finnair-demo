import { PassengerRepository } from '../repositories/passenger.repository'
import { FlightRepository } from '../repositories/flight.repository'
import { BookingRepository } from '../repositories/booking.repository'
import { FlightBookingRepository } from '../repositories/flightbooking.repository'
import { getDynamoDBClient } from './dynamodb.client'
import { logger } from './logger'

export class MockDataSeeder {
  private passengerRepo: PassengerRepository
  private flightRepo: FlightRepository
  private bookingRepo: BookingRepository
  private flightBookingRepo: FlightBookingRepository

  constructor() {
    const dynamoClient = getDynamoDBClient()
    this.passengerRepo = new PassengerRepository(dynamoClient)
    this.flightRepo = new FlightRepository(dynamoClient)
    this.bookingRepo = new BookingRepository(dynamoClient)
    this.flightBookingRepo = new FlightBookingRepository(dynamoClient)
  }

  // Mack data generated with AI
  async seedData() {
    try {
      logger.info('Seeding mock data...')

      // Flights
      const flight1 = await this.flightRepo.create({
        flightNumber: 'AY123',
        departureAirport: 'HEL',
        arrivalAirport: 'LHR',
        departureDate: '2024-01-15',
        arrivalDate: '2024-01-15',
        bookings: [],
      })

      const flight2 = await this.flightRepo.create({
        flightNumber: 'AY456',
        departureAirport: 'LHR',
        arrivalAirport: 'JFK',
        departureDate: '2024-01-15', // Same day connection
        arrivalDate: '2024-01-15',
        bookings: [],
      })

      const flight3 = await this.flightRepo.create({
        flightNumber: 'AY789',
        departureAirport: 'HEL',
        arrivalAirport: 'CDG',
        departureDate: '2024-01-15', // Same day as AY123
        arrivalDate: '2024-01-15',
        bookings: [],
      })

      // Return flights
      const flight4 = await this.flightRepo.create({
        flightNumber: 'AY124',
        departureAirport: 'LHR',
        arrivalAirport: 'HEL',
        departureDate: '2024-01-16',
        arrivalDate: '2024-01-16',
        bookings: [],
      })

      const flight5 = await this.flightRepo.create({
        flightNumber: 'AY457',
        departureAirport: 'JFK',
        arrivalAirport: 'LHR',
        departureDate: '2024-01-16',
        arrivalDate: '2024-01-16',
        bookings: [],
      })

      // Asian routes
      const flight6 = await this.flightRepo.create({
        flightNumber: 'AY101',
        departureAirport: 'HEL',
        arrivalAirport: 'NRT',
        departureDate: '2024-01-15',
        arrivalDate: '2024-01-16', // Next day arrival
        bookings: [],
      })

      const flight7 = await this.flightRepo.create({
        flightNumber: 'AY102',
        departureAirport: 'NRT',
        arrivalAirport: 'HEL',
        departureDate: '2024-01-17',
        arrivalDate: '2024-01-17',
        bookings: [],
      })

      // Domestic Scandinavia
      const flight8 = await this.flightRepo.create({
        flightNumber: 'AY201',
        departureAirport: 'HEL',
        arrivalAirport: 'ARN',
        departureDate: '2024-01-15',
        arrivalDate: '2024-01-15',
        bookings: [],
      })

      // ===== BOOKINGS =====
      // Single passenger, single flight
      const booking1 = await this.bookingRepo.create({
        passengerIds: [],
        flightIds: [flight1.flightId],
        bookingDate: '2024-01-01',
      })

      // Family booking - multiple passengers, round trip
      const booking2 = await this.bookingRepo.create({
        passengerIds: [],
        flightIds: [flight1.flightId, flight4.flightId],
        bookingDate: '2024-01-02',
      })

      // Business traveler - complex multi-city route
      const booking3 = await this.bookingRepo.create({
        passengerIds: [],
        flightIds: [
          flight1.flightId,
          flight2.flightId,
          flight5.flightId,
          flight4.flightId,
        ],
        bookingDate: '2024-01-03',
      })

      // Group booking - multiple passengers, same flight
      const booking4 = await this.bookingRepo.create({
        passengerIds: [],
        flightIds: [flight3.flightId],
        bookingDate: '2024-01-04',
      })

      // Long-haul booking
      const booking5 = await this.bookingRepo.create({
        passengerIds: [],
        flightIds: [flight6.flightId, flight7.flightId],
        bookingDate: '2024-01-05',
      })

      // Same-day multiple flights
      const booking6 = await this.bookingRepo.create({
        passengerIds: [],
        flightIds: [flight8.flightId, flight3.flightId],
        bookingDate: '2024-01-06',
      })

      // Single flight, different passenger
      const booking7 = await this.bookingRepo.create({
        passengerIds: [],
        flightIds: [flight1.flightId],
        bookingDate: '2024-01-07',
      })

      // ===== PASSENGERS =====
      // Business traveler - complex route
      const passenger1 = await this.passengerRepo.create({
        passengerId: 'PAX001',
        firstName: 'Matti',
        lastName: 'Virtanen',
        email: 'matti.virtanen@finnair.com',
        bookingId: booking3.bookingId,
      })

      // Family 1 - Parents
      const passenger2 = await this.passengerRepo.create({
        passengerId: 'PAX002',
        firstName: 'Anna',
        lastName: 'Korhonen',
        email: 'anna.korhonen@example.com',
        bookingId: booking2.bookingId,
      })

      const passenger3 = await this.passengerRepo.create({
        passengerId: 'PAX003',
        firstName: 'Ville',
        lastName: 'Korhonen',
        email: 'ville.korhonen@example.com',
        bookingId: booking2.bookingId,
      })

      // Family 1 - Children
      const passenger4 = await this.passengerRepo.create({
        passengerId: 'PAX004',
        firstName: 'Aino',
        lastName: 'Korhonen',
        email: 'aino.korhonen@example.com',
        bookingId: booking2.bookingId,
      })

      const passenger5 = await this.passengerRepo.create({
        passengerId: 'PAX005',
        firstName: 'Eero',
        lastName: 'Korhonen',
        email: 'eero.korhonen@example.com',
        bookingId: booking2.bookingId,
      })

      // Corporate group
      const passenger6 = await this.passengerRepo.create({
        passengerId: 'PAX006',
        firstName: 'Liisa',
        lastName: 'Järvinen',
        email: 'liisa.jarvinen@company.fi',
        bookingId: booking4.bookingId,
      })

      const passenger7 = await this.passengerRepo.create({
        passengerId: 'PAX007',
        firstName: 'Jukka',
        lastName: 'Mäkelä',
        email: 'jukka.makela@company.fi',
        bookingId: booking4.bookingId,
      })

      const passenger8 = await this.passengerRepo.create({
        passengerId: 'PAX008',
        firstName: 'Sanna',
        lastName: 'Virtanen',
        email: 'sanna.virtanen@company.fi',
        bookingId: booking4.bookingId,
      })

      // Solo travelers
      const passenger9 = await this.passengerRepo.create({
        passengerId: 'PAX009',
        firstName: 'Hannu',
        lastName: 'Laine',
        email: 'hannu.laine@gmail.com',
        bookingId: booking1.bookingId,
      })

      const passenger10 = await this.passengerRepo.create({
        passengerId: 'PAX010',
        firstName: 'Riitta',
        lastName: 'Savolainen',
        email: 'riitta.savolainen@hotmail.com',
        bookingId: booking5.bookingId,
      })

      // Multi-city traveler
      const passenger11 = await this.passengerRepo.create({
        passengerId: 'PAX011',
        firstName: 'Timo',
        lastName: 'Hakkarainen',
        email: 'timo.hakkarainen@example.com',
        bookingId: booking6.bookingId,
      })

      // Another solo traveler on same flight
      const passenger12 = await this.passengerRepo.create({
        passengerId: 'PAX012',
        firstName: 'Elina',
        lastName: 'Nordström',
        email: 'elina.nordstrom@example.com',
        bookingId: booking7.bookingId,
      })

      // ===== FLIGHT-BOOKING RELATIONSHIPS =====
      // Single flight bookings
      await this.flightBookingRepo.create(flight1.flightId, booking1.bookingId)
      await this.flightBookingRepo.create(flight1.flightId, booking7.bookingId)

      // Round trip family booking
      await this.flightBookingRepo.create(flight1.flightId, booking2.bookingId)
      await this.flightBookingRepo.create(flight4.flightId, booking2.bookingId)

      // Complex business trip
      await this.flightBookingRepo.create(flight1.flightId, booking3.bookingId)
      await this.flightBookingRepo.create(flight2.flightId, booking3.bookingId)
      await this.flightBookingRepo.create(flight5.flightId, booking3.bookingId)
      await this.flightBookingRepo.create(flight4.flightId, booking3.bookingId)

      // Group booking
      await this.flightBookingRepo.create(flight3.flightId, booking4.bookingId)

      // Long-haul round trip
      await this.flightBookingRepo.create(flight6.flightId, booking5.bookingId)
      await this.flightBookingRepo.create(flight7.flightId, booking5.bookingId)

      // Same-day multi-city
      await this.flightBookingRepo.create(flight8.flightId, booking6.bookingId)
      await this.flightBookingRepo.create(flight3.flightId, booking6.bookingId)

      logger.info('✅ Complex mock data seeded successfully!')
      logger.info('📊 Data Summary:', {
        flights: {
          total: 8,
          routes: [
            'AY123: HEL→LHR (3 bookings, 7 passengers)',
            'AY456: LHR→JFK (1 booking, 1 passenger)',
            'AY789: HEL→CDG (2 bookings, 4 passengers)',
            'AY124: LHR→HEL (2 bookings, 5 passengers)',
            'AY457: JFK→LHR (1 booking, 1 passenger)',
            'AY101: HEL→NRT (1 booking, 1 passenger)',
            'AY102: NRT→HEL (1 booking, 1 passenger)',
            'AY201: HEL→ARN (1 booking, 1 passenger)',
          ],
        },
        bookings: {
          total: 7,
          types: [
            'Single passenger, single flight',
            'Family round trip (4 passengers)',
            'Business multi-city (1 passenger, 4 flights)',
            'Corporate group (3 passengers)',
            'Long-haul round trip (1 passenger)',
            'Same-day multi-city (1 passenger)',
            'Solo traveler (1 passenger)',
          ],
        },
        passengers: {
          total: 12,
          categories: [
            'Business travelers: 2',
            'Family members: 4',
            'Corporate group: 3',
            'Solo travelers: 3',
          ],
        },
        testScenarios: [
          'Multiple passengers on same flight (AY123)',
          'Same passenger on multiple flights (PAX001)',
          'Family bookings with children',
          'Corporate group bookings',
          'International connections',
          'Same-day multiple flights',
          'Round-trip bookings',
        ],
      })

      // Test data verification
      logger.info('Test Scenarios Available:', {
        'Heavy flight (AY123)': 'Has 7 passengers from 3 different bookings',
        'Multi-flight passenger (PAX001)': 'Has 4 flights in complex route',
        'Family booking (booking2)': 'Has 4 passengers on 2 flights',
        'Corporate group (booking4)': 'Has 3 passengers on 1 flight',
        'Same date flights': 'Multiple flights on 2024-01-15',
        'International routes': 'Including HEL→NRT with timezone changes',
        'Connection flights': 'LHR→JFK connecting from HEL→LHR',
      })
    } catch (error) {
      logger.error(
        'Error seeding mock data:',
        error instanceof Error ? error : new Error('Unknown error')
      )
      throw error
    }
  }
}
