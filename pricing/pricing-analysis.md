# AWS Pricing Analysis: Product Image OCR Processing System

## Executive Summary

This document provides a comprehensive cost analysis for the Product Image OCR Processing System built on AWS serverless architecture. The system leverages AWS Lambda, API Gateway, S3, DynamoDB, and Amazon Bedrock with Claude Sonnet for intelligent OCR processing.

## Architecture Overview

The system consists of:
- **Frontend**: React.js application (hosted locally)
- **API Layer**: Amazon API Gateway (REST API)
- **Processing Layer**: AWS Lambda functions (Node.js 18.x)
- **Storage Layer**: Amazon S3 (image storage) + DynamoDB (metadata/results)
- **AI/ML Layer**: Amazon Bedrock with Claude Sonnet model

## Pricing Breakdown by Service

### 1. AWS Lambda

**Pricing Model**: Pay-per-use (requests + compute duration)

**Request Pricing**:
- $0.0000002 per request (first 1M requests/month free)

**Compute Pricing** (GB-seconds):
- Tier 1 (0-6B GB-seconds): $0.0000166667 per GB-second
- Tier 2 (6B-15B GB-seconds): $0.0000150000 per GB-second  
- Tier 3 (15B+ GB-seconds): $0.0000133334 per GB-second

**Functions in System**:
- UploadHandler: Generates pre-signed S3 URLs
- OCRProcessor: Processes images using Bedrock
- StatusHandler: Returns processing status and results

### 2. Amazon API Gateway

**Pricing Model**: Pay-per-request

**REST API Pricing**:
- First 333M requests/month: $3.50 per million requests
- Next 667M requests/month: $2.80 per million requests
- Next 19B requests/month: $2.38 per million requests
- Over 20B requests/month: $1.51 per million requests

**HTTP API Pricing** (Alternative, lower cost):
- First 300M requests/month: $1.00 per million requests
- Over 300M requests/month: $0.90 per million requests

### 3. Amazon S3

**Pricing Model**: Pay-per-use (storage + requests)

**Storage Pricing** (Standard):
- First 50 TB/month: $0.023 per GB
- Next 450 TB/month: $0.022 per GB
- Over 500 TB/month: $0.021 per GB

**Request Pricing**:
- PUT/COPY/POST/LIST: $0.0005 per 1,000 requests
- GET/SELECT: $0.0004 per 1,000 requests

### 4. Amazon DynamoDB

**Pricing Model**: On-demand (pay-per-request)

**Read Request Units**:
- $0.125 per million read request units

**Write Request Units**:
- $0.625 per million write request units

**Storage**:
- First 25 GB/month: Free
- Beyond 25 GB: $0.25 per GB-month

### 5. Amazon Bedrock Foundation Models

**Claude Sonnet Pricing** (estimated based on available models):
- Input tokens: $0.30 - $3.00 per million tokens (varies by model)
- Output tokens: $1.50 - $15.00 per million tokens (varies by model)

*Note: Exact Claude Sonnet pricing varies by specific model version*

## Cost Scenarios

### Scenario 1: Low Usage (100 images/month)

**Assumptions**:
- 100 image uploads per month
- Average image size: 2MB
- Average processing time: 3 seconds per image
- Lambda memory allocation: 512MB
- Average tokens per image: 1,000 input, 500 output

**Monthly Costs**:

| Service | Usage | Cost |
|---------|-------|------|
| **Lambda** | | |
| - Requests | 300 requests (3 functions × 100 images) | $0.00 (free tier) |
| - Compute | 300 × 3s × 0.5GB = 450 GB-seconds | $0.01 |
| **API Gateway** | 300 requests | $0.00 (minimal) |
| **S3** | | |
| - Storage | 200MB average | $0.00 (minimal) |
| - Requests | 100 PUT + 300 GET | $0.00 (minimal) |
| **DynamoDB** | | |
| - Writes | 200 write requests | $0.00 (minimal) |
| - Reads | 300 read requests | $0.00 (minimal) |
| - Storage | <1GB | $0.00 (free tier) |
| **Bedrock** | 100K input + 50K output tokens | $0.38 |
| **Total** | | **$0.39/month** |

### Scenario 2: Medium Usage (1,000 images/month)

**Assumptions**:
- 1,000 image uploads per month
- Average image size: 2MB
- Average processing time: 3 seconds per image
- Lambda memory allocation: 512MB
- Average tokens per image: 1,000 input, 500 output

**Monthly Costs**:

| Service | Usage | Cost |
|---------|-------|------|
| **Lambda** | | |
| - Requests | 3,000 requests | $0.00 (free tier) |
| - Compute | 4,500 GB-seconds | $0.08 |
| **API Gateway** | 3,000 requests | $0.01 |
| **S3** | | |
| - Storage | 2GB average | $0.05 |
| - Requests | 1,000 PUT + 3,000 GET | $0.00 |
| **DynamoDB** | | |
| - Writes | 2,000 write requests | $0.00 |
| - Reads | 3,000 read requests | $0.00 |
| - Storage | ~5GB | $0.00 (free tier) |
| **Bedrock** | 1M input + 500K output tokens | $3.75 |
| **Total** | | **$3.89/month** |

### Scenario 3: High Usage (10,000 images/month)

**Assumptions**:
- 10,000 image uploads per month
- Average image size: 2MB
- Average processing time: 3 seconds per image
- Lambda memory allocation: 512MB
- Average tokens per image: 1,000 input, 500 output

**Monthly Costs**:

| Service | Usage | Cost |
|---------|-------|------|
| **Lambda** | | |
| - Requests | 30,000 requests | $0.00 (free tier) |
| - Compute | 45,000 GB-seconds | $0.75 |
| **API Gateway** | 30,000 requests | $0.11 |
| **S3** | | |
| - Storage | 20GB average | $0.46 |
| - Requests | 10,000 PUT + 30,000 GET | $0.02 |
| **DynamoDB** | | |
| - Writes | 20,000 write requests | $0.01 |
| - Reads | 30,000 read requests | $0.00 |
| - Storage | ~50GB | $6.25 |
| **Bedrock** | 10M input + 5M output tokens | $37.50 |
| **Total** | | **$45.10/month** |

### Scenario 4: Enterprise Usage (100,000 images/month)

**Assumptions**:
- 100,000 image uploads per month
- Average image size: 2MB
- Average processing time: 3 seconds per image
- Lambda memory allocation: 1GB (optimized)
- Average tokens per image: 1,000 input, 500 output

**Monthly Costs**:

| Service | Usage | Cost |
|---------|-------|------|
| **Lambda** | | |
| - Requests | 300,000 requests | $0.04 |
| - Compute | 900,000 GB-seconds | $15.00 |
| **API Gateway** | 300,000 requests | $1.05 |
| **S3** | | |
| - Storage | 200GB average | $4.60 |
| - Requests | 100,000 PUT + 300,000 GET | $0.17 |
| **DynamoDB** | | |
| - Writes | 200,000 write requests | $0.13 |
| - Reads | 300,000 read requests | $0.04 |
| - Storage | ~500GB | $118.75 |
| **Bedrock** | 100M input + 50M output tokens | $375.00 |
| **Total** | | **$514.78/month** |

## Cost Optimization Recommendations

### Immediate Optimizations

1. **Use HTTP API instead of REST API**
   - Savings: ~70% on API Gateway costs
   - Impact: $0.90 vs $3.50 per million requests

2. **Optimize Lambda Memory Allocation**
   - Right-size memory based on actual usage
   - Consider provisioned concurrency for consistent workloads

3. **Implement S3 Lifecycle Policies**
   - Move older images to IA or Glacier storage classes
   - Potential savings: 40-80% on storage costs

4. **DynamoDB Optimization**
   - Use provisioned capacity for predictable workloads
   - Enable auto-scaling for variable workloads

### Advanced Optimizations

1. **Bedrock Model Selection**
   - Evaluate different Claude models for cost/performance trade-offs
   - Consider batch processing for multiple images

2. **Caching Strategy**
   - Implement CloudFront for frequently accessed images
   - Cache API responses for repeated queries

3. **Reserved Capacity**
   - Consider DynamoDB reserved capacity for high-volume scenarios
   - Evaluate Savings Plans for Lambda compute

4. **Monitoring and Alerting**
   - Set up CloudWatch billing alarms
   - Monitor per-service costs with Cost Explorer

## Free Tier Benefits

**First 12 Months**:
- Lambda: 1M requests + 400,000 GB-seconds/month
- API Gateway: 1M REST API calls/month
- S3: 5GB storage + 20,000 GET + 2,000 PUT requests/month
- DynamoDB: 25GB storage + 25 WCU + 25 RCU

**Always Free**:
- Lambda: 1M requests + 400,000 GB-seconds/month
- DynamoDB: 25GB storage + 25 WCU + 25 RCU

## Pricing Assumptions and Exclusions

### Assumptions
- Standard ON DEMAND pricing model
- US East (N. Virginia) region pricing
- No reserved capacity or savings plans
- Average processing complexity and token usage
- No data transfer costs between services in same region

### Exclusions
- Data transfer costs to/from internet
- CloudWatch Logs storage and monitoring costs
- Development and testing environment costs
- Custom domain and SSL certificate costs
- Backup and disaster recovery costs
- Support plan costs

## Monitoring and Cost Control

### Recommended Monitoring
1. **CloudWatch Metrics**
   - Lambda duration and memory utilization
   - API Gateway request counts and latency
   - DynamoDB consumed capacity
   - Bedrock token usage

2. **Cost Monitoring**
   - AWS Cost Explorer for service-level costs
   - Billing alerts for budget thresholds
   - AWS Budgets for proactive cost management

3. **Performance Monitoring**
   - X-Ray tracing for end-to-end visibility
   - CloudWatch dashboards for operational metrics

### Cost Control Strategies
1. **Budget Alerts**: Set up alerts at 50%, 80%, and 100% of budget
2. **Resource Tagging**: Tag all resources for cost allocation
3. **Regular Reviews**: Monthly cost and usage reviews
4. **Optimization Cycles**: Quarterly optimization assessments

## Conclusion

The Product Image OCR Processing System offers a highly scalable, serverless architecture with costs that scale linearly with usage. The primary cost driver is Amazon Bedrock for AI processing, representing 85-95% of total costs in most scenarios.

For low to medium usage (up to 1,000 images/month), costs remain very affordable at under $4/month. High-volume scenarios require careful optimization, particularly around Bedrock model selection and DynamoDB capacity planning.

The serverless architecture provides excellent cost efficiency for variable workloads, with no upfront costs and automatic scaling based on demand.

---

**Document Version**: 1.0  
**Last Updated**: November 8, 2025  
**Region**: US East (N. Virginia)  
**Currency**: USD
