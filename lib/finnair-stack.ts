import * as cdk from 'aws-cdk-lib'
import { Construct, Node } from 'constructs'
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam'
// import Mustache from 'mustache'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { readFileSync } from 'fs'
import path from 'path'

export class FinnairStack extends cdk.Stack {
  public readonly passengersTable: Table
  public readonly flightsTable: Table
  public readonly bookingsTable: Table
  public readonly flightBookingTable: Table

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // DynamoDB tables for the Finnair application
    // passengersTable: Stores passenger information
    const passengersTable = new Table(this, 'PassengerTable', {
      partitionKey: { name: 'passengerId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Only for dev/test environments
    })
    passengersTable.addGlobalSecondaryIndex({
      indexName: 'BookingIndex',
      partitionKey: { name: 'bookingId', type: AttributeType.STRING },
    })

    // flightsTable: Stores flight information
    const flightsTable = new Table(this, 'FlightTable', {
      partitionKey: { name: 'flightId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Only for dev/test environments
    })
    flightsTable.addGlobalSecondaryIndex({
      indexName: 'FlightNumberDateIndex',
      partitionKey: { name: 'flightNumber', type: AttributeType.STRING },
      sortKey: { name: 'departureDate', type: AttributeType.STRING },
    })

    const bookingsTable = new Table(this, 'BookingTable', {
      partitionKey: { name: 'bookingId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Only for dev/test environments
    })
    bookingsTable.addGlobalSecondaryIndex({
      indexName: 'BookingReferenceIndex',
      partitionKey: { name: 'bookingReference', type: AttributeType.STRING },
    })

    const flightBookingTable = new Table(this, 'FlightBookingTable', {
      partitionKey: { name: 'flightId', type: AttributeType.STRING },
      sortKey: { name: 'bookingId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Only for dev/test environments
    })
    flightBookingTable.addGlobalSecondaryIndex({
      indexName: 'BookingFlightIndex',
      partitionKey: { name: 'bookingId', type: AttributeType.STRING },
      sortKey: { name: 'flightId', type: AttributeType.STRING },
    })

    // Naming the tables for easier access in Lambda functions
    this.passengersTable = passengersTable
    this.flightsTable = flightsTable
    this.bookingsTable = bookingsTable
    this.flightBookingTable = flightBookingTable

    const getPassengers = new NodejsFunction(this, 'GetPassengersLambda', {
      entry: 'lambda/get-passengers.ts',
      handler: 'handler',
      environment: {
        PASSENGERS_TABLE_NAME: passengersTable.tableName,
        FLIGHTS_TABLE_NAME: flightsTable.tableName,
        BOOKINGS_TABLE_NAME: bookingsTable.tableName,
        FLIGHT_BOOKING_TABLE_NAME: flightBookingTable.tableName,
      },
    })
    const getPassengerById = new NodejsFunction(
      this,
      'GetPassengerByIdLambda',
      {
        entry: 'lambda/get-passenger-by-id.ts',
        handler: 'handler',
        environment: {
          PASSENGERS_TABLE_NAME: passengersTable.tableName,
          FLIGHTS_TABLE_NAME: flightsTable.tableName,
          BOOKINGS_TABLE_NAME: bookingsTable.tableName,
          FLIGHT_BOOKING_TABLE_NAME: flightBookingTable.tableName,
        },
      }
    )

    const seedDataLambda = new NodejsFunction(this, 'SeedDataLambda', {
      entry: 'lambda/deploy-seed.ts',
      handler: 'handler',
      timeout: cdk.Duration.minutes(5), // Increased timeout for seeding data
      environment: {
        PASSENGERS_TABLE_NAME: passengersTable.tableName,
        FLIGHTS_TABLE_NAME: flightsTable.tableName,
        BOOKINGS_TABLE_NAME: bookingsTable.tableName,
        FLIGHT_BOOKING_TABLE_NAME: flightBookingTable.tableName,
      },
    })

    // console.log('Lambda Function ARNs:')
    // console.log('getPassengers ARN:', getPassengers.functionArn)
    // console.log('getPassengerById ARN:', getPassengerById.functionArn)
    // console.log('seedDataLambda ARN:', seedDataLambda.functionArn)

    //Permissions for reading tables
    flightsTable.grantReadData(getPassengers)
    flightBookingTable.grantReadData(getPassengers)
    passengersTable.grantReadData(getPassengers)
    bookingsTable.grantReadData(getPassengers)

    flightsTable.grantReadData(getPassengerById)
    flightBookingTable.grantReadData(getPassengerById)
    passengersTable.grantReadData(getPassengerById)
    bookingsTable.grantReadData(getPassengerById)

    flightsTable.grantWriteData(seedDataLambda)
    flightBookingTable.grantWriteData(seedDataLambda)
    passengersTable.grantWriteData(seedDataLambda)
    bookingsTable.grantWriteData(seedDataLambda)

    getPassengers.addPermission('InvokeByApiGateway', {
      principal: new ServicePrincipal('apigateway.amazonaws.com'),
    })
    getPassengerById.addPermission('InvokeByApiGateway', {
      principal: new ServicePrincipal('apigateway.amazonaws.com'),
    })
    seedDataLambda.addPermission('InvokeByApiGateway', {
      principal: new ServicePrincipal('apigateway.amazonaws.com'),
    })

    // Create the API Gateway using OpenAPI specification

    const openApiSpec = JSON.parse(
      readFileSync(path.join(__dirname, '../openapi-spec.json'), 'utf8')
    )

    const api = new apigateway.SpecRestApi(this, 'CrewPasApi', {
      apiDefinition: apigateway.ApiDefinition.fromInline(openApiSpec),
      restApiName: 'CrewPas API',
      description: 'API for Finnair Crew Passenger Management',
      deployOptions: {
        stageName: 'prod',
      },
    })

    const cfnApi = api.node.defaultChild as apigateway.CfnRestApi
    // For GET /passengers
    cfnApi.addPropertyOverride(
      'Body.paths./passengers.get.x-amazon-apigateway-integration.uri',
      `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${getPassengers.functionArn}/invocations`
    )

    // For GET /passengers/{passengerId}
    cfnApi.addPropertyOverride(
      'Body.paths./passengers/{passengerId}.get.x-amazon-apigateway-integration.uri',
      `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${getPassengerById.functionArn}/invocations`
    )

    // For POST /utils/seed
    cfnApi.addPropertyOverride(
      'Body.paths./utils/seed.post.x-amazon-apigateway-integration.uri',
      `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${seedDataLambda.functionArn}/invocations`
    )

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'CrewPas API URL',
    })

    new cdk.CfnOutput(this, 'SeedDataUrl', {
      value: `${api.url}utils/seed`,
      description: 'URL to seed mock data (POST request)',
    })

    new cdk.CfnOutput(this, 'TestEndpoints', {
      value: JSON.stringify({
        getPassengers: `${api.url}passengers?flightNumber=AY123&departureDate=2024-01-15`,
        getPassengerById: `${api.url}passengers/PAX001`,
        seedData: `${api.url}utils/seed`,
      }),
      description: 'Test endpoints for the API',
    })
  }
}
