#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductOcrStack110820251737 } from '../lib/cdk-stack';

const app = new cdk.App();
new ProductOcrStack110820251737(app, 'ProductOcrStack110820251737', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
