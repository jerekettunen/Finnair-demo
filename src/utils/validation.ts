import { components } from '../../types/openapi'

export class ValidationError extends Error {
  field?: string

  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class BusinessError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BusinessError'
  }
}

export const validateFlightNumber = (flightnumber: string): void => {
  if (!flightnumber) {
    throw new ValidationError('Flight number is required', 'flightnumber')
  }

  const regex = /^[A-Z]{2}\d{1,4}$/
  if (!regex.test(flightnumber)) {
    throw new ValidationError(
      'Invalid flight number format. Expected format: AA1234',
      'flightnumber'
    )
  }
}

export const validateAirportCode = (airportCode: string): void => {
  if (!airportCode) {
    throw new ValidationError('Airport code is required', 'airportCode')
  }

  const regex = /^[A-Z]{3}$/
  if (!regex.test(airportCode)) {
    throw new ValidationError(
      'Invalid airport code format. Expected format: AAA',
      'airportCode'
    )
  }
}

export const validateBookingId = (bookingId: string): void => {
  if (!bookingId) {
    throw new ValidationError('Booking ID is required', 'bookingId')
  }

  const regex = /^[A-Z0-9]{6}$/
  if (!regex.test(bookingId)) {
    throw new ValidationError(
      'Invalid booking ID format. Expected format: A1B2C3 or similar',
      'bookingId'
    )
  }
}

export const validateDate = (dateString: string, fieldName: string): void => {
  if (!dateString) {
    throw new ValidationError(`${fieldName} is required`, fieldName)
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/
  if (!datePattern.test(dateString)) {
    throw new ValidationError(
      `Invalid date format for ${fieldName}. Expected format: YYYY-MM-DD`,
      fieldName
    )
  }

  // check actual date validity
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    throw new ValidationError(
      `Invalid date format for ${fieldName}. Expected format: YYYY-MM-DD`,
      fieldName
    )
  }

  // Turn off if necessary
  // const today = new Date()
  // if (date < today) {
  //   throw new ValidationError(`${fieldName} cannot be in the past`)
  // }
}

export const validateDepartureDate = (departureDate: string): void => {
  validateDate(departureDate, 'Departure date')
  // placeholder for potential expansion
}

export const validatePassengerId = (passengerId: string): void => {
  if (!passengerId || passengerId.trim() === '') {
    throw new ValidationError('Passenger ID is required', 'passengerId')
  }

  if (passengerId.length < 6 || passengerId.length > 12) {
    throw new ValidationError(
      'Passenger ID must be between 6 and 12 characters',
      'passengerId'
    )
  }

  const regex = /^[A-Z0-9_-]+$/
  if (!regex.test(passengerId)) {
    throw new ValidationError(
      'Passenger ID must contain only uppercase letters, numbers, hyphens, or underscores',
      'passengerId'
    )
  }
}

export const validateEmail = (email: string): void => {
  if (!email) {
    throw new ValidationError('Email is required', 'email')
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(email)) {
    throw new ValidationError('Invalid email format', 'email')
  }
}
