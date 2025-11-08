import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';

export class ProductOcrStack110820251737 extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const suffix = '110820251737';

    // S3 Bucket for image storage
    const imageBucket = new s3.Bucket(this, `ImageBucket${suffix}`, {
      bucketName: `product-ocr-images-${suffix}`,
      versioned: true,
      cors: [{
        allowedHeaders: ['*'],
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.DELETE, s3.HttpMethods.HEAD],
        allowedOrigins: ['*'],
        exposedHeaders: ['ETag'],
        maxAge: 3000
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // DynamoDB table for storing OCR results
    const ocrTable = new dynamodb.Table(this, `OcrTable${suffix}`, {
      tableName: `product-ocr-results-${suffix}`,
      partitionKey: { name: 'imageId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Enable auto scaling
    ocrTable.autoScaleReadCapacity({
      minCapacity: 1,
      maxCapacity: 10
    });
    ocrTable.autoScaleWriteCapacity({
      minCapacity: 1,
      maxCapacity: 10
    });

    // IAM role for Lambda functions
    const lambdaRole = new iam.Role(this, `LambdaRole${suffix}`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
      ],
      inlinePolicies: {
        S3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
              resources: [imageBucket.bucketArn + '/*']
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:ListBucket'],
              resources: [imageBucket.bucketArn]
            })
          ]
        }),
        DynamoDBAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:UpdateItem', 'dynamodb:Query'],
              resources: [ocrTable.tableArn]
            })
          ]
        }),
        BedrockAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['bedrock:InvokeModel'],
              resources: ['arn:aws:bedrock:*::foundation-model/anthropic.claude-sonnet-4-20250514-v1:0']
            })
          ]
        })
      }
    });

    // Upload Handler Lambda
    const uploadHandler = new lambda.Function(this, `UploadHandler${suffix}`, {
      functionName: `product-ocr-upload-${suffix}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/upload-handler'),
      role: lambdaRole,
      environment: {
        BUCKET_NAME: imageBucket.bucketName,
        TABLE_NAME: ocrTable.tableName
      },
      timeout: cdk.Duration.seconds(30)
    });

    // OCR Processor Lambda
    const ocrProcessor = new lambda.Function(this, `OcrProcessor${suffix}`, {
      functionName: `product-ocr-processor-${suffix}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/ocr-processor'),
      role: lambdaRole,
      environment: {
        BUCKET_NAME: imageBucket.bucketName,
        TABLE_NAME: ocrTable.tableName
      },
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024
    });

    // Status Handler Lambda
    const statusHandler = new lambda.Function(this, `StatusHandler${suffix}`, {
      functionName: `product-ocr-status-${suffix}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/status-handler'),
      role: lambdaRole,
      environment: {
        TABLE_NAME: ocrTable.tableName
      },
      timeout: cdk.Duration.seconds(30)
    });

    // S3 event notification to trigger OCR processor
    imageBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(ocrProcessor));

    // API Gateway
    const api = new apigateway.RestApi(this, `ProductOcrApi${suffix}`, {
      restApiName: `product-ocr-api-${suffix}`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*']
      }
    });

    // API Gateway integrations
    const uploadIntegration = new apigateway.LambdaIntegration(uploadHandler);
    const statusIntegration = new apigateway.LambdaIntegration(statusHandler);

    // API endpoints
    api.root.addResource('upload').addMethod('POST', uploadIntegration);
    const statusResource = api.root.addResource('status');
    statusResource.addResource('{imageId}').addMethod('GET', statusIntegration);
    const resultsResource = api.root.addResource('results');
    resultsResource.addResource('{imageId}').addMethod('GET', statusIntegration);

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: imageBucket.bucketName,
      description: 'S3 Bucket Name'
    });
  }
}
