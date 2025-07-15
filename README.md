# Finnair CrewPas Demo API

A simple REST API for airline crew to look up passenger information during flights. Built for the Finnair technical interview.

## What it does

- Get all passengers on a specific flight
- Look up individual passenger details and their full itinerary
- Handles realistic airline scenarios like family bookings, business travelers, and corporate groups

## Tech Stack

- **AWS Lambda** for the API endpoints
- **DynamoDB** for data storage (with GSI for fast lookups)
- **API Gateway** for REST endpoints
- **CDK** for deploying everything to AWS
- **TypeScript** throughout

## API Endpoints

```
GET /passengers?flightNumber=AY123&departureDate=2024-01-15
GET /passengers/{passengerId}
POST /utils/seed
```

## How to use it

```bash
# Build project
npm run build

# Deploy to AWS
npm run deploy

# Run the demo (shows all the scenarios)
npm run demo

# Or test endpoints manually
curl "https://your-api-url/passengers?flightNumber=AY123&departureDate=2024-01-15"
```

## Demo scenarios

I created realistic test data with Finnish names and actual Finnair routes (check src/utils/mock-data-seeder.ts for all possibilities):

- **AY123** - Busy Helsinki to London flight with 7 passengers from different bookings
- **PAX001** - Business traveler doing HEL→LHR→JFK→LHR→HEL (4 flights)
- **PAX002** - Family of 4 doing a round trip
- Various corporate bookings, international flights, etc.

The demo script shows both raw JSON responses and readable summaries.

## Key decisions

- Used DynamoDB because airline systems need to scale massively
- Serverless architecture for cost efficiency and auto-scaling
- OpenAPI spec for proper API documentation
- Realistic test data to show understanding of airline operations

## Commands

```bash
npm run deploy    # Deploy to AWS
npm run demo      # Run demo script
npm run destroy   # Clean up AWS resources
npm run build     # Compile TypeScript
```

## Notes

Built in a weekend for the Finnair interview process.
