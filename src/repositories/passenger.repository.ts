import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
  QueryCommand,
  BatchGetCommand,
} from '@aws-sdk/lib-dynamodb'
import { components } from '../../types/openapi'

type PassengerSummary = components['schemas']['PassengerSummary']
type PassengerDetails = components['schemas']['PassengerDetails']

export interface PassengerRecord {
  passengerId: string

  firstName: string
  lastName: string
  email: string

  bookingId: string

  createdAt: string
  updatedAt: string
}

interface CreatePassengerInput {
  passengerId: string
  firstName: string
  lastName: string
  email: string
  bookingId: string
}

export class PassengerRepository {
  constructor(private docClient: DynamoDBDocumentClient) {}

  async findById(passengerId: string): Promise<PassengerRecord | null> {
    const command = new GetCommand({
      TableName: process.env.PASSENGERS_TABLE_NAME,
      Key: { passengerId },
    })

    const result = await this.docClient.send(command)
    return result.Item as PassengerRecord | null
  }

  async create(passenger: CreatePassengerInput): Promise<PassengerRecord> {
    const now = new Date().toISOString()
    const record: PassengerRecord = {
      passengerId: passenger.passengerId,
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      email: passenger.email,
      bookingId: passenger.bookingId,
      createdAt: now,
      updatedAt: now,
    }

    const command = new PutCommand({
      TableName: process.env.PASSENGERS_TABLE_NAME,
      Item: record,
    })

    await this.docClient.send(command)
    return record
  }

  /*
  async update(passengerId: string, updates: Partial<PassengerDetails>): Promise<PassengerRecord | null> {
    null
  }
     */
  async delete(passengerId: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: process.env.PASSENGERS_TABLE_NAME,
      Key: { passengerId },
    })

    await this.docClient.send(command)
  }

  async findByBookingId(bookingId: string): Promise<PassengerRecord[]> {
    if (!bookingId) {
      return []
    }

    const command = new QueryCommand({
      TableName: process.env.PASSENGERS_TABLE_NAME,
      IndexName: 'BookingIndex',
      KeyConditionExpression: 'bookingId = :bookingId',
      ExpressionAttributeValues: {
        ':bookingId': bookingId,
      },
    })

    const result = await this.docClient.send(command)
    return (result.Items as PassengerRecord[]) || []
  }

  async findByBookingIds(bookingIds: string[]): Promise<PassengerRecord[]> {
    if (!bookingIds || bookingIds.length === 0) {
      return []
    }

    const queryPromises = bookingIds.map((bookingId) => {
      return this.findByBookingId(bookingId)
    })

    const results = await Promise.all(queryPromises)
    return results.flat()
  }
}
