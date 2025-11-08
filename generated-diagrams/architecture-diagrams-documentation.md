# Product Image OCR Processing System - Architecture Diagrams

## Overview
This document describes the AWS architecture diagrams generated for the Product Image OCR Processing System. The system uses a serverless architecture to process product images and extract structured data using Amazon Bedrock's Claude Sonnet model.

## Generated Diagrams

### 1. Main Architecture Diagram
**File:** `product-ocr-architecture.png`

This diagram shows the high-level architecture of the system including:

- **Frontend Layer**: React.js application for user interaction
- **API Layer**: Amazon API Gateway for REST endpoints
- **Processing Layer**: Three Lambda functions handling different aspects:
  - Upload Handler: Generates pre-signed S3 URLs
  - OCR Processor: Processes images using Bedrock
  - Status Handler: Returns processing status and results
- **Storage Layer**: 
  - S3 Bucket for image storage
  - DynamoDB for results and status tracking
- **AI/ML Layer**: Amazon Bedrock with Claude Sonnet model
- **Monitoring**: CloudWatch for logs and metrics

### 2. Processing Flow Diagram
**File:** `product-ocr-sequence-flow.png`

This diagram illustrates the complete processing flow including:

- User interaction flow from frontend to backend
- Upload process using pre-signed URLs
- S3 event-triggered processing pipeline
- Bedrock integration for OCR processing
- Status polling mechanism
- IAM security integration

## Key Architecture Components

### Serverless Processing Pipeline
1. **Image Upload**: Direct upload to S3 using pre-signed URLs
2. **Event Trigger**: S3 object creation triggers OCR processor
3. **AI Processing**: Bedrock Claude Sonnet extracts product data
4. **Data Storage**: Results stored in DynamoDB
5. **Status Polling**: Frontend polls for completion status

### Security Features
- IAM roles and policies for service-to-service authentication
- Pre-signed URLs for secure direct S3 uploads
- Encrypted storage in S3 and DynamoDB
- API Gateway CORS configuration

### Scalability Features
- Serverless Lambda functions auto-scale with demand
- DynamoDB on-demand billing scales automatically
- S3 provides unlimited storage capacity
- CloudWatch monitoring for performance tracking

## Data Flow Summary

1. User selects image in React frontend
2. Frontend requests upload URL from API Gateway
3. Upload Handler Lambda generates pre-signed S3 URL
4. Frontend uploads image directly to S3
5. S3 object creation event triggers OCR Processor Lambda
6. OCR Processor sends image to Bedrock Claude Sonnet
7. Extracted product data is stored in DynamoDB
8. Frontend polls Status Handler for results
9. Status Handler returns processed data from DynamoDB

## Technology Stack

- **Frontend**: React.js
- **API**: Amazon API Gateway (REST)
- **Compute**: AWS Lambda (Node.js 18.x)
- **Storage**: Amazon S3, Amazon DynamoDB
- **AI/ML**: Amazon Bedrock (Claude Sonnet)
- **Monitoring**: Amazon CloudWatch
- **Security**: AWS IAM
- **Infrastructure**: AWS CDK (TypeScript)

## File Locations

All diagrams are stored in:
`/home/pandson/echo-architect-artifacts/product-ocr-system-110820251737/generated-diagrams/`

- Main Architecture: `product-ocr-architecture.png`
- Processing Flow: `product-ocr-sequence-flow.png`
- This Documentation: `architecture-diagrams-documentation.md`
