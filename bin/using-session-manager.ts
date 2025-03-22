#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { NetworkStack } from "../lib/stack.Networking";
import { BastionStack } from "../lib/stack.BastionHost";
import { RemoteResourcesStack } from "../lib/stack.RemoteResources";

const app = new cdk.App();
const network_stack = new NetworkStack(app, "UsingSessionManager-Network", {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration.
   * If you do this, add similar declarations to each stack in the app.
   */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
const bastion = new BastionStack(app, "UsingSessionManager-Bastion", {
  vpc: network_stack.vpc,
});

const remoteResources = new RemoteResourcesStack(
  app,
  "UsingSessionManager-RemoteResources",
  {
    vpc: network_stack.vpc,
    bastionSg: bastion.bastionSg,
  },
);
