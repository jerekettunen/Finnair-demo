import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

export const getDynamoDBClient = (): DynamoDBDocumentClient => {
  if (!process.env.AWS_REGION) {
    throw new Error('AWS_REGION environment variable is required')
  }

  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    maxAttempts: 3, // Retry up to 3 times on failure
  })
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      convertEmptyValues: true, // Convert empty strings to null
      removeUndefinedValues: true, // Remove undefined values
      convertClassInstanceToMap: true, // Convert class instances to maps
    },
    unmarshallOptions: {
      wrapNumbers: false, // Do not wrap numbers in BigInt
    },
  })
}
