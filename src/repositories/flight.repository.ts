import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { components } from '../../types/openapi'

export type FlightInfo = components['schemas']['FlightInfo']

export interface FlightRecord {
  flightId: string // Primary key
  flightNumber: string
  departureAirport: string
  arrivalAirport: string
  departureDate: string
  arrivalDate: string

  createdAt: string
  updatedAt: string
}

export class FlightRepository {
  constructor(private docClient: DynamoDBDocumentClient) {}

  async findById(flightId: string): Promise<FlightRecord | null> {
    const command = new GetCommand({
      TableName: process.env.FLIGHTS_TABLE_NAME,
      Key: { flightId },
    })

    const result = await this.docClient.send(command)
    return result.Item as FlightRecord | null
  }

  async create(flight: FlightInfo): Promise<FlightRecord> {
    const now = new Date().toISOString()
    const record: FlightRecord = {
      ...flight,
      flightId: `${flight.flightNumber}-${flight.departureDate}`, // Composite key
      createdAt: now,
      updatedAt: now,
    }

    const command = new PutCommand({
      TableName: process.env.FLIGHTS_TABLE_NAME,
      Item: record,
    })

    await this.docClient.send(command)
    return record
  }

  async delete(flightId: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: process.env.FLIGHTS_TABLE_NAME,
      Key: { flightId },
    })
    await this.docClient.send(command)
  }

  async findByFlightNumberAndDate(
    flightNumber: string,
    departureDate: string
  ): Promise<FlightRecord | null> {
    const command = new QueryCommand({
      TableName: process.env.FLIGHTS_TABLE_NAME,
      IndexName: 'FlightNumberDateIndex',
      KeyConditionExpression:
        'flightNumber = :flightNumber AND departureDate = :departureDate',
      ExpressionAttributeValues: {
        ':flightNumber': flightNumber,
        ':departureDate': departureDate,
      },
    })

    const result = await this.docClient.send(command)
    return result.Items?.[0] as FlightRecord | null
  }
}
