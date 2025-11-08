# AWS Product Image OCR Processing System

A serverless AWS-based system that automatically extracts product specifications from uploaded images using Amazon Bedrock with Claude model, stores data in DynamoDB, and provides a React frontend for user interaction.

## 🏗️ Architecture Overview

This system implements a complete serverless architecture for product image OCR processing:

- **Frontend**: React TypeScript application with drag-and-drop image upload
- **API Layer**: AWS API Gateway REST API
- **Compute**: AWS Lambda functions for processing
- **Storage**: Amazon S3 for images, DynamoDB for structured data
- **AI/ML**: Amazon Bedrock with Claude Sonnet model for OCR processing

## 📋 Features

### Core Functionality
- **Image Upload**: Secure drag-and-drop interface with pre-signed S3 URLs
- **OCR Processing**: Automatic extraction of product specifications using Amazon Bedrock
- **Real-time Status**: Live updates on processing status
- **Structured Data**: Organized display of extracted product information
- **Error Handling**: Comprehensive error handling throughout the pipeline

### Extracted Data Points
- Product name and brand
- Category and price information
- Physical dimensions and weight
- Product descriptions
- Additional specifications

## 🚀 Quick Start

### Prerequisites
- AWS CLI configured with appropriate permissions
- Node.js 18+ and npm
- AWS CDK CLI installed

### Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/pandson7/product-ocr-system-110820251737.git
   cd product-ocr-system-110820251737
   ```

2. **Deploy AWS Infrastructure**
   ```bash
   cd cdk
   npm install
   cdk bootstrap
   cdk deploy
   ```

3. **Deploy Lambda Functions**
   ```bash
   # Upload Handler
   cd ../lambda/upload-handler
   npm install
   zip -r upload-handler.zip .
   aws lambda update-function-code --function-name product-ocr-upload-110820251737 --zip-file fileb://upload-handler.zip

   # OCR Processor
   cd ../ocr-processor
   npm install
   zip -r ocr-processor.zip .
   aws lambda update-function-code --function-name product-ocr-processor-110820251737 --zip-file fileb://ocr-processor.zip

   # Status Handler
   cd ../status-handler
   npm install
   zip -r status-handler.zip .
   aws lambda update-function-code --function-name product-ocr-status-110820251737 --zip-file fileb://status-handler.zip
   ```

4. **Deploy Frontend**
   ```bash
   cd ../../frontend
   npm install
   npm run build
   # Deploy to your preferred hosting service (S3, Netlify, Vercel, etc.)
   ```

## 📁 Project Structure

```
product-ocr-system-110820251737/
├── README.md                          # This file
├── PROJECT_SUMMARY.md                 # Detailed project summary
├── cdk/                              # AWS CDK infrastructure code
│   ├── lib/cdk-stack.ts             # Main CDK stack definition
│   ├── bin/cdk.ts                   # CDK app entry point
│   └── package.json                 # CDK dependencies
├── lambda/                           # Lambda function implementations
│   ├── upload-handler/               # Handles image upload requests
│   ├── ocr-processor/               # Processes images with Bedrock
│   └── status-handler/              # Returns processing status
├── frontend/                         # React TypeScript application
│   ├── src/                         # Source code
│   ├── public/                      # Static assets
│   └── package.json                 # Frontend dependencies
├── generated-diagrams/               # Architecture diagrams
├── specs/                           # Technical specifications
├── pricing/                         # Cost analysis
└── qr-code/                         # Project QR code
```

## 🔧 Configuration

### Environment Variables

The system uses the following AWS resources (automatically created by CDK):

- **S3 Bucket**: `product-ocr-images-110820251737`
- **DynamoDB Table**: `product-ocr-results-110820251737`
- **Lambda Functions**: 
  - `product-ocr-upload-110820251737`
  - `product-ocr-processor-110820251737`
  - `product-ocr-status-110820251737`
- **API Gateway**: `product-ocr-api-110820251737`

### Frontend Configuration

Update the API endpoint in `frontend/src/App.tsx`:

```typescript
const API_BASE_URL = 'https://your-api-gateway-url.amazonaws.com/prod';
```

## 🧪 Testing

### Sample Images
Sample product images are available in the `qr-code/` directory for testing the OCR functionality.

### End-to-End Testing
1. Start the frontend application
2. Upload a product image using the drag-and-drop interface
3. Monitor the processing status in real-time
4. View the extracted product specifications

## 📊 Architecture Diagrams

The project includes comprehensive architecture diagrams in the `generated-diagrams/` folder:
- System architecture overview
- Sequence flow diagram
- Component relationships

## 💰 Cost Estimation

Detailed cost analysis is available in `pricing/pricing-analysis.md`, including:
- AWS service costs breakdown
- Usage-based pricing estimates
- Cost optimization recommendations

## 🔒 Security

### Implemented Security Measures
- **IAM Roles**: Least-privilege access for all AWS services
- **Pre-signed URLs**: Secure, time-limited S3 upload URLs
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Comprehensive validation for all user inputs
- **Error Handling**: Secure error messages without sensitive information exposure

## 🚀 Scalability

The system is designed for automatic scaling:
- **Lambda Functions**: Automatic scaling based on demand
- **DynamoDB**: Auto-scaling read/write capacity
- **S3**: Unlimited storage capacity
- **API Gateway**: Handles high request volumes

## 🛠️ Development

### Local Development Setup

1. **Backend Development**
   ```bash
   cd lambda/[function-name]
   npm install
   npm run test
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Infrastructure Changes**
   ```bash
   cd cdk
   npm install
   cdk diff
   cdk deploy
   ```

### Code Quality
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Comprehensive error handling
- Unit tests for Lambda functions

## 📝 API Documentation

### Endpoints

- **POST /upload**: Generate pre-signed URL for image upload
- **GET /status/{imageId}**: Get processing status
- **GET /results/{imageId}**: Get extracted product data

### Request/Response Examples

See the `specs/` directory for detailed API documentation and examples.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the troubleshooting section in `specs/`
- Review the CloudWatch logs for debugging

## 🏷️ Tags

`aws` `serverless` `ocr` `react` `typescript` `lambda` `dynamodb` `s3` `bedrock` `claude` `api-gateway` `cdk`

---

**Project ID**: product-ocr-system-110820251737  
**Last Updated**: November 8, 2025  
**Version**: 1.0.0
