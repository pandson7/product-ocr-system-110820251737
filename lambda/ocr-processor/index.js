const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    if (record.eventName.startsWith('ObjectCreated')) {
      const bucketName = record.s3.bucket.name;
      const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
      
      // Extract imageId from S3 key
      const imageId = objectKey.split('/')[1].split('-')[0];
      
      try {
        // Update status to processing
        await dynamoClient.send(new UpdateItemCommand({
          TableName: process.env.TABLE_NAME,
          Key: { imageId: { S: imageId } },
          UpdateExpression: 'SET #status = :status',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: { ':status': { S: 'processing' } }
        }));

        // Get image from S3
        const getObjectResponse = await s3Client.send(new GetObjectCommand({
          Bucket: bucketName,
          Key: objectKey
        }));

        const imageBuffer = await streamToBuffer(getObjectResponse.Body);
        const base64Image = imageBuffer.toString('base64');

        // Process with Bedrock Claude
        const prompt = `Analyze this product image and extract the following information in JSON format:
{
  "productName": "exact product name",
  "brand": "brand name",
  "category": "product category",
  "price": "price if visible",
  "dimensions": "dimensions if visible",
  "weight": "weight if visible", 
  "description": "detailed product description",
  "additionalDetails": "any other visible product information"
}

Only return valid JSON, no other text.`;

        const bedrockPayload = {
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: getObjectResponse.ContentType || "image/jpeg",
                    data: base64Image
                  }
                },
                {
                  type: "text",
                  text: prompt
                }
              ]
            }
          ]
        };

        const bedrockCommand = new InvokeModelCommand({
          modelId: "anthropic.claude-sonnet-4-20250514-v1:0",
          body: JSON.stringify(bedrockPayload)
        });

        const bedrockResponse = await bedrockClient.send(bedrockCommand);
        const responseBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
        
        let extractedData;
        try {
          const content = responseBody.content[0].text;
          extractedData = JSON.parse(content);
        } catch (parseError) {
          console.error('Failed to parse Bedrock response:', parseError);
          extractedData = {
            productName: "Unable to extract",
            brand: "Unable to extract",
            category: "Unable to extract",
            price: "Unable to extract",
            dimensions: "Unable to extract",
            weight: "Unable to extract",
            description: "OCR processing failed",
            additionalDetails: "Error parsing response"
          };
        }

        // Update DynamoDB with results
        await dynamoClient.send(new UpdateItemCommand({
          TableName: process.env.TABLE_NAME,
          Key: { imageId: { S: imageId } },
          UpdateExpression: 'SET #status = :status, processedTimestamp = :timestamp, extractedData = :data',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: {
            ':status': { S: 'completed' },
            ':timestamp': { N: Date.now().toString() },
            ':data': { S: JSON.stringify(extractedData) }
          }
        }));

        console.log(`Successfully processed image ${imageId}`);

      } catch (error) {
        console.error(`Error processing image ${imageId}:`, error);
        
        // Update status to failed
        await dynamoClient.send(new UpdateItemCommand({
          TableName: process.env.TABLE_NAME,
          Key: { imageId: { S: imageId } },
          UpdateExpression: 'SET #status = :status, errorMessage = :error',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: {
            ':status': { S: 'failed' },
            ':error': { S: error.message }
          }
        }));
      }
    }
  }
};

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
