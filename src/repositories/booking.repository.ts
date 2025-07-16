import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { components } from '../../types/openapi'

export interface BookingRecord {
  bookingId: string // Primary key
  passengerCount: number

  passengerIds: string[]
  flightIds: string[]
  bookingDate: string

  createdAt: string
  updatedAt: string
}

export class BookingRepository {
  constructor(private docClient: DynamoDBDocumentClient) {}

  async findById(bookingId: string): Promise<BookingRecord | null> {
    const command = new GetCommand({
      TableName: process.env.BOOKINGS_TABLE_NAME,
      Key: { bookingId },
    })

    const result = await this.docClient.send(command)
    return result.Item as BookingRecord | null
  }

  async create(
    input: Omit<
      BookingRecord,
      'bookingId' | 'createdAt' | 'updatedAt' | 'passengerCount'
    >
  ): Promise<BookingRecord> {
    const now = new Date().toISOString()
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts) {
      const bookingId = this.generateBookingId()

      const record: BookingRecord = {
        bookingId,
        passengerCount: input.passengerIds.length,
        passengerIds: input.passengerIds,
        flightIds: input.flightIds,
        bookingDate: input.bookingDate,
        createdAt: now,
        updatedAt: now,
      }

      const command = new PutCommand({
        TableName: process.env.BOOKINGS_TABLE_NAME,
        Item: record,
        ConditionExpression: 'attribute_not_exists(bookingId)',
      })

      try {
        await this.docClient.send(command)
        return record
      } catch (error: any) {
        if (error.name === 'ConditionalCheckFailedException') {
          attempts++
          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 10 * attempts))
            continue
          }
        }
        throw error
      }
    }

    throw new Error(
      `Failed to generate unique booking ID after ${maxAttempts} attempts`
    )
  }

  private generateBookingId(): string {
    const now = Date.now()
    const timeComponent = now.toString(36).slice(-3).toUpperCase()

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let random = ''
    for (let i = 0; i < 3; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return timeComponent + random
  }
}
