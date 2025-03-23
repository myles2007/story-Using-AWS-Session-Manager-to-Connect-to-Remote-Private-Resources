# Welcome

This project is intended to be used alongside my Medium story titled:

[Using AWS SSM Session Manager to Connect to Private Resources: Port Forwarding Edition](https://medium.com/@mylesloffler/using-aws-ssm-session-manager-to-connect-to-private-resources-3083f55e3f16)

Please see this story as a guide for using this branch of this repository.

To clone this branch of the repository, run the following command:
```
git clone -b port-forwarding-edition git@github.com:myles2007/story-Using-AWS-Session-Manager-to-Connect-to-Remote-Private-Resources.git using-session-manager.port-forwarding-edition
```

# What We'll Be Doing
We'll be using AWS SSM Session Manager to connect to a remote, private database through an EC2 instance with no connectivity to the public internet.

All resources are defined using AWS CDK for easy deployment and teardown.

# Project Structure
The project structure is reflective of `cdk init app --languge=typescript` with additional files and directories to support the specific solution.

For this specific variant:

```
.
├── README.md
├── bin
│   └── using-session-manager.ts
├── cdk.json
├── jest.config.js
├── lib
│   ├── construct.SimpleAuroraDB.ts
│   ├── stack.BastionHost.ts
│   ├── stack.Networking.ts
│   ├── stack.RemoteResources.ts
├── package-lock.json
├── package.json
├── scratch.sh
├── test
│   └── using-session-manager.test.ts
└── tsconfig.json

5 directories, 15 files
```

# The Stacks
of several stacks to allow for modular deployment.

The stacks are:

 - Networking (required for all stories)
 - BastionHost
 - RemoteResources (e.g., Aurora RDS Cluster)

The exact stacks and resources will vary per story.

>[!WARNING]
> Several of the resources launched by this example are billed based on the time they are provisined.
>
> Free Tier eligible resources are used wherever possible, but none of these
> resources exist in the Always Free Tier and will eventually become paid.
>
> This solution will cost approximately $33/month to run if the database is mostly inactive.
>
> **You should delete your CloudFormation stacks associated with this repository
> when you are done with them to avoid unexpected bills**
