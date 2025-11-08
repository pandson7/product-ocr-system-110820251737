const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const imageId = event.pathParameters.imageId;

    if (!imageId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'imageId is required' })
      };
    }

    const result = await dynamoClient.send(new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: { imageId: { S: imageId } }
    }));

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Image not found' })
      };
    }

    const item = {
      imageId: result.Item.imageId.S,
      status: result.Item.status.S,
      uploadTimestamp: result.Item.uploadTimestamp ? parseInt(result.Item.uploadTimestamp.N) : null,
      processedTimestamp: result.Item.processedTimestamp ? parseInt(result.Item.processedTimestamp.N) : null,
      fileName: result.Item.fileName ? result.Item.fileName.S : null,
      s3Key: result.Item.s3Key ? result.Item.s3Key.S : null
    };

    if (result.Item.extractedData) {
      item.extractedData = JSON.parse(result.Item.extractedData.S);
    }

    if (result.Item.errorMessage) {
      item.errorMessage = result.Item.errorMessage.S;
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(item)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
