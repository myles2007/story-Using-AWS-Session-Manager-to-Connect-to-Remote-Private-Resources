import * as cdk from "aws-cdk-lib";
import {
  aws_ec2 as ec2,
  aws_iam as iam,
  aws_rds as rds,
  RemovalPolicy,
  Tags,
} from "aws-cdk-lib";
import { SubnetGroup } from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import { SimpleAuroraDB } from "./construct.SimpleAuroraDB";

interface RemoteResourcesStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  bastionSg: ec2.SecurityGroup;
  resources: {
    db: boolean;
  };
}

export class RemoteResourcesStack extends cdk.Stack {
  public db: SimpleAuroraDB | undefined;

  constructor(scope: Construct, id: string, props: RemoteResourcesStackProps) {
    super(scope, id, props);

    if (props.resources.db) {
      const db = new SimpleAuroraDB(this, "UsingSessionManager-AuroraDB", {
        vpc: props.vpc,
      });
      db.allowIngress(props.bastionSg, "Allow Bastion to connect to the DB");
    }
  }
}
