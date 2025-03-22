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

interface SimpleAuroraDBProps {
  vpc: ec2.Vpc;
}

const DB_NAME = "using_session_manager_demo";

export class SimpleAuroraDB extends Construct {
  private dbClusterSg: ec2.SecurityGroup;
  private cluster: rds.DatabaseCluster;

  constructor(scope: Construct, id: string, props: SimpleAuroraDBProps) {
    super(scope, id);

    const databaseEngine = rds.DatabaseClusterEngine.auroraPostgres({
      version: rds.AuroraPostgresEngineVersion.VER_16_6,
    });

    const clusterReaderParameterGroup = new rds.ParameterGroup(
      this,
      "DbClusterParamGroup",
      {
        engine: databaseEngine,
        description:
          "Parameter group for using-session-manager-to-connect-to-remote-resources",
      },
    );

    const clusterWriterParameterGroup = new rds.ParameterGroup(
      this,
      "DbClusterWriterParamGroup",
      {
        engine: databaseEngine,
        description:
          "Writer parameter group for using-session-manager-to-connect-to-remote-resources",
      },
    );

    const rootCredentialsSecret = rds.Credentials.fromGeneratedSecret("root", {
      secretName: `/using-session-manager-to-connect-to-remote-resources/database/credentials`,
    });

    this.dbClusterSg = new ec2.SecurityGroup(this, "DbClusterSg", {
      vpc: props.vpc,
      description:
        "SG for using-session-manager-to-connect-to-remote-resources DB",
    });

    const instanceProps: rds.ClusterInstanceOptions = {
      autoMinorVersionUpgrade: true,
      enablePerformanceInsights: false,
      publiclyAccessible: false, // We specifically don't want this (which will usually be true)
    };

    this.cluster = new rds.DatabaseCluster(this, "DbCluster", {
      engine: databaseEngine,
      credentials: rootCredentialsSecret,
      defaultDatabaseName: DB_NAME,
      serverlessV2MinCapacity: 0, // Scale all the way down to zero when idle
      serverlessV2MaxCapacity: 1, // This is just a demo, so keep it small
      deletionProtection: true,
      storageEncrypted: true,
      iamAuthentication: true,
      parameterGroup: clusterReaderParameterGroup,
      vpc: props.vpc,
      // NOTE: Changing the SubnetGroup will cause the cluster to be replaced.
      //       This CDK Construct will define the SubnetGroup for you, but some
      //       changes, like replacing the VPC, are easier to do if you define
      //       the SubnetGroup yourself so you can directly control when
      //       the replacement happens.
      subnetGroup: new SubnetGroup(this, "Subnets", {
        description: `Subnets for using-session-manager-to-connect-to-remote-resources`,
        vpc: props.vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      }),
      // This is a demo, we want to destroy the cluster when the stack is deleted.
      // WARNING: You probably don't want this in most cases.
      removalPolicy: RemovalPolicy.DESTROY,
      securityGroups: [this.dbClusterSg],
      writer: rds.ClusterInstance.serverlessV2("writer", {
        ...instanceProps,
        parameterGroup: clusterWriterParameterGroup,
      }),
      readers: [
        // You can have multiple readers, but for this demo we will just have one
        rds.ClusterInstance.serverlessV2("reader-1", {
          ...instanceProps,
          parameterGroup: clusterReaderParameterGroup,
          scaleWithWriter: true, // Scale the reader with the writer
        }),
      ],
    });

    new cdk.CfnOutput(this, "DbClusterEndpoint", {
      value: `${this.cluster.clusterEndpoint.hostname}`,
      description: "The cluster endpoint",
    });
    new cdk.CfnOutput(this, "DatabaseName", {
      value: DB_NAME,
      description: "The name of the database within the cluster",
    });
  }

  // Allow ingress from a peer (e.g. the bastion host) to the database cluster
  allowIngress(peer: ec2.IPeer, ruleDescription?: string) {
    const ports = new Set([this.cluster.clusterEndpoint.port]);
    for (const port of ports) {
      this.dbClusterSg.addIngressRule(
        peer,
        ec2.Port.tcp(port),
        ruleDescription ?? `Allow ingress from ${peer.uniqueId}`,
      );
    }
  }
}
