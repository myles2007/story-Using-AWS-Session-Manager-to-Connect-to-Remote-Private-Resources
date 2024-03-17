import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface BastionStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class BastionStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: BastionStackProps) {
    super(scope, id, props);

    const bastionSecurityGroup = new ec2.SecurityGroup(this, "bastionSecurityGroup", {
      vpc: props.vpc,
      allowAllOutbound: true,
    });

    const bastion = new ec2.BastionHostLinux(this, "bastion", {
      vpc: props.vpc,
      // This EC2 instance will reside in a private subnet without
      // any access to the internet at all.
      subnetSelection: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      requireImdsv2: true,
      // It's security group will allow all outbound traffic, so that it
      // can communicate with the Systems Manager service in the VPC.
      // It still cannot communicate with the internet, however.
      securityGroup: bastionSecurityGroup,
      instanceName: `${this.node.path}-bastion`,
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cpuType: ec2.AmazonLinuxCpuType.ARM_64,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.NANO
      ),
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: ec2.BlockDeviceVolume.ebs(8, {
            encrypted: true,
          }),
        },
      ],
    });

    // We don't really need custom anything here, but without this
    // override, the BastionHostLinux construct won't create successfully
    // more than once inside of a single AWS account and region.
    // See:
    //  - https://github.com/aws/aws-cdk/issues/22695
    //  - https://github.com/aws/aws-cdk/issues/22695#issuecomment-1300235173
    const bastionLaunchTemplate = new ec2.LaunchTemplate(
      this,
      "UsingSessionManager-BastionLaunchTemplate",
      {}
    );

    const cfnInstance = bastion.instance.node.defaultChild as ec2.CfnInstance;
    cfnInstance.launchTemplate = {
      launchTemplateId: bastionLaunchTemplate.launchTemplateId,
      version: bastionLaunchTemplate.latestVersionNumber,
    };
  }
}