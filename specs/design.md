# Technical Design Document

## Architecture Overview

The AWS Product Image OCR Processing System follows a serverless architecture pattern using AWS managed services. The system consists of a React frontend, API Gateway for REST endpoints, Lambda functions for processing logic, S3 for image storage, DynamoDB for data persistence, and Amazon Bedrock with Claude for intelligent OCR processing.

## System Components

### Frontend Layer
- **Technology**: React.js application hosted locally
- **Functionality**: Image upload interface, real-time status updates, results display
- **Key Features**: Drag-and-drop upload, progress indicators, responsive design

### API Layer
- **Service**: Amazon API Gateway (REST API)
- **Authentication**: IAM-based authentication
- **Endpoints**:
  - POST /upload - Generate pre-signed S3 URL for image upload
  - GET /status/{imageId} - Check processing status
  - GET /results/{imageId} - Retrieve extracted product data

### Processing Layer
- **Runtime**: Node.js 18.x Lambda functions
- **Functions**:
  - **UploadHandler**: Generates pre-signed S3 URLs for secure image uploads
  - **OCRProcessor**: Triggered by S3 events, processes images using Bedrock
  - **StatusHandler**: Returns processing status and results

### Storage Layer
- **Image Storage**: Amazon S3 bucket with versioning enabled
- **Data Storage**: Amazon DynamoDB table with on-demand billing
- **Table Schema**:
  ```json
  {
    "imageId": "string (partition key)",
    "status": "string (processing|completed|failed)",
    "uploadTimestamp": "number",
    "processedTimestamp": "number",
    "extractedData": {
      "productName": "string",
      "brand": "string",
      "category": "string",
      "price": "string",
      "dimensions": "string",
      "weight": "string",
      "description": "string",
      "additionalDetails": "object"
    },
    "s3Key": "string",
    "errorMessage": "string (optional)"
  }
  ```

### AI/ML Layer
- **Service**: Amazon Bedrock with Claude Sonnet model
- **Purpose**: Intelligent text extraction and product specification analysis
- **Input**: Base64-encoded image data
- **Output**: Structured JSON with extracted product information

## Sequence Diagrams

### Image Upload and Processing Flow
```
User -> Frontend: Select/drag image
Frontend -> API Gateway: POST /upload
API Gateway -> UploadHandler Lambda: Generate pre-signed URL
UploadHandler -> S3: Create pre-signed URL
S3 -> UploadHandler: Return signed URL
UploadHandler -> API Gateway: Return URL
API Gateway -> Frontend: Return upload URL
Frontend -> S3: Upload image directly
S3 -> OCRProcessor Lambda: Trigger on object creation
OCRProcessor -> Bedrock: Send image for analysis
Bedrock -> OCRProcessor: Return extracted data
OCRProcessor -> DynamoDB: Store results
Frontend -> API Gateway: Poll GET /status/{imageId}
API Gateway -> StatusHandler Lambda: Check status
StatusHandler -> DynamoDB: Query processing status
DynamoDB -> StatusHandler: Return status/results
StatusHandler -> API Gateway: Return response
API Gateway -> Frontend: Display results
```

## Data Flow Architecture

1. **Upload Phase**: User uploads image through React frontend to S3 via pre-signed URL
2. **Trigger Phase**: S3 object creation event triggers OCRProcessor Lambda function
3. **Processing Phase**: Lambda function sends image to Bedrock Claude model for analysis
4. **Storage Phase**: Extracted data is stored in DynamoDB with processing metadata
5. **Retrieval Phase**: Frontend polls API for status and retrieves results when complete

## Security Considerations

### IAM Roles and Policies
- **Lambda Execution Role**: Access to S3, DynamoDB, Bedrock, and CloudWatch Logs
- **API Gateway Role**: Invoke Lambda functions
- **S3 Bucket Policy**: Restrict access to authorized principals only

### Data Protection
- S3 bucket encryption at rest using AWS managed keys
- DynamoDB encryption at rest enabled
- API Gateway with CORS configuration for frontend access
- Input validation for all API endpoints

## Infrastructure as Code

### CDK Implementation
- **Language**: TypeScript CDK
- **Stacks**:
  - **StorageStack**: S3 bucket and DynamoDB table
  - **ComputeStack**: Lambda functions and IAM roles
  - **APIStack**: API Gateway and endpoints
  - **MainStack**: Orchestrates all components

### Resource Configuration
- **S3 Bucket**: 
  - Versioning enabled
  - Event notifications for Lambda triggers
  - CORS configuration for frontend access
- **DynamoDB Table**:
  - On-demand billing mode
  - Point-in-time recovery enabled
- **Lambda Functions**:
  - Node.js 18.x runtime
  - Environment variables for resource ARNs
  - Appropriate timeout and memory settings

## Performance Considerations

- **Image Processing**: Asynchronous processing to handle large images
- **API Response**: Quick response times with status polling pattern
- **Scaling**: Serverless architecture automatically scales with demand
- **Caching**: DynamoDB provides fast data retrieval for results

## Error Handling

- **Upload Failures**: Graceful error messages in frontend
- **Processing Errors**: Logged to CloudWatch with user notification
- **API Errors**: Proper HTTP status codes and error responses
- **Timeout Handling**: Appropriate timeouts for Bedrock API calls

## Monitoring and Logging

- **CloudWatch Logs**: All Lambda function logs
- **CloudWatch Metrics**: API Gateway and Lambda metrics
- **Error Tracking**: Failed processing attempts logged and monitored
- **Performance Metrics**: Processing time and success rates tracked
