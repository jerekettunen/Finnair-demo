import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'

export interface FlightBookingRecord {
  flightId: string // Primary key
  bookingId: string // Sort key
  createdAt: string
  updatedAt: string
}

export class FlightBookingRepository {
  constructor(private docClient: DynamoDBDocumentClient) {}

  async findBookingIdsByFlightId(flightId: string): Promise<string[]> {
    if (!flightId) {
      throw new Error('Flight ID is required')
    }

    const command = new QueryCommand({
      TableName: process.env.FLIGHT_BOOKING_TABLE_NAME,
      KeyConditionExpression: 'flightId = :flightId',
      ExpressionAttributeValues: {
        ':flightId': flightId,
      },
    })
    const result = await this.docClient.send(command)
    return result.Items?.map((item) => item.bookingId) || []
  }

  async findFlightsByBookingId(
    bookingId: string
  ): Promise<FlightBookingRecord[]> {
    if (!bookingId) {
      throw new Error('Booking ID is required')
    }

    const command = new QueryCommand({
      TableName: process.env.FLIGHT_BOOKING_TABLE_NAME,
      IndexName: 'BookingFlightIndex',
      KeyConditionExpression: 'bookingId = :bookingId',
      ExpressionAttributeValues: {
        ':bookingId': bookingId,
      },
    })
    const result = await this.docClient.send(command)
    return (result.Items as FlightBookingRecord[]) || []
  }

  async create(
    flightId: string,
    bookingId: string
  ): Promise<FlightBookingRecord> {
    if (!flightId || !bookingId) {
      throw new Error('Flight ID and Booking ID are required')
    }

    const record: FlightBookingRecord = {
      flightId,
      bookingId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const command = new PutCommand({
      TableName: process.env.FLIGHT_BOOKING_TABLE_NAME,
      Item: record,
    })

    await this.docClient.send(command)
    return record
  }
}
