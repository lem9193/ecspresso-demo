#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { EcspressoDemoStack } from '@lib/ecspresso-demo-stack';

import 'source-map-support/register';

export interface Props extends cdk.StackProps {
  prefix: string;
  isFirst: string;
}

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
} as const satisfies cdk.Environment;

const isFirst = app.node.tryGetContext('isFirst') ?? 'y';

const props = {
  env,
  prefix: 'ecspresso-demo',
  isFirst,
} as const satisfies Props;

new EcspressoDemoStack(app, 'ecspresso-demo-stack', {
  ...props,
});

cdk.custom_resources.CustomResourceConfig.of(app).addLogRetentionLifetime(
  cdk.aws_logs.RetentionDays.ONE_DAY,
);

cdk.custom_resources.CustomResourceConfig.of(app).addRemovalPolicy(
  cdk.RemovalPolicy.DESTROY,
);
