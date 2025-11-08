const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({ region: process.env.AWS_REGION });
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
    const body = JSON.parse(event.body);
    const { fileName, fileType } = body;

    if (!fileName || !fileType) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'fileName and fileType are required' })
      };
    }

    const imageId = uuidv4();
    const s3Key = `images/${imageId}-${fileName}`;

    // Generate pre-signed URL
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // Create initial record in DynamoDB
    await dynamoClient.send(new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        imageId: { S: imageId },
        status: { S: 'uploading' },
        uploadTimestamp: { N: Date.now().toString() },
        s3Key: { S: s3Key },
        fileName: { S: fileName }
      }
    }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        imageId,
        uploadUrl,
        s3Key
      })
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
