import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

const VPC_CIDR = "10.0.0.0/16"; // 65,536 IP addresses in total
const SUBNET_CIDR_MASK = 20;    // 4096 IP addresses per subnet
const MAX_AZ_COUNT = 1;         // Just one AZ... we don't need more for this example

export class NetworkStack extends cdk.Stack {

  // We'll import this in our other stacks. Doing so will implicitly
  // create a CloudFormation export/import that allows us to reference
  // the VPC in other stacks.
  //
  // NOTE:
  // As a consequence, you won't be able to delete or fundamentally
  // change the VPC without first dereferencing it in other stacks
  // by either deleting them or replacing all references to the
  // old VPC with references to a new VPC.
  //
  // For the purposes of this example stack, I recommend deleting
  // and redeploying the entire application if you need to change
  // the VPC.
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, "VPC", {
      ipAddresses: ec2.IpAddresses.cidr(VPC_CIDR),
      maxAzs: MAX_AZ_COUNT,
      natGateways: 0,
      // Gateway VPC Endpoints are free to provision and use.
      // This allows traffic to S3 and DynamoDB from within your
      // VPC without needing to traverse the public internet
      gatewayEndpoints: {
        // We do need this one for some SSM Systems Manager functionality
        S3: {
          service: ec2.GatewayVpcEndpointAwsService.S3,
        },
        // We won't use this in our example, but it's free to provision
        DynamoDB: {
          service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
        },
      },
      subnetConfiguration: [
        {
          // Public subnet with internet connectivity
          cidrMask: SUBNET_CIDR_MASK,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          // Private subnet with internet connectivity
          // (via a NAT Gateway we have not provisioned)
          cidrMask: SUBNET_CIDR_MASK,
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          // Isolated subnet without internet connectivity
          cidrMask: SUBNET_CIDR_MASK,
          name: "Isolated",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // The For SSM to work without routing traffic over the public internet
    // (and thus requiring a NAT Gateway), we define the following VPC
    // Interface Endpoints. This allows the SSM Agent to communicate with
    // the SSM service without needing to traverse the public internet.
    //
    // See https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-create-vpc.html
    //
    /// NOTE: Each VPC Interface Endpoint costs $0.01 per AZ per hour plus
    //        $0.01 per GB of data processed. A NAT Gateway costs $0.045 per
    //        hour plus $0.045 per GB of data processed and involves the
    //        public internet (which may be a security concern).
    //
    //        The "ec2messages" endpoint has been omitted here because it is not
    //        required if you're using Systems Manager to create VSS-enabled snapshots
    //        which we are not doing in this example.
    this.vpc.addInterfaceEndpoint("ssm", {
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
    });
    // this.vpc.addInterfaceEndpoint("ec2messages", {
    //   service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
    // });
    this.vpc.addInterfaceEndpoint("ssmmessages", {
      service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
    });
  }
}