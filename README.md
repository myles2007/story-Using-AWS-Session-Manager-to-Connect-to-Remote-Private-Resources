# Welcome

This project is intended to be used alongside my Medium story titled:

[Using AWS SSM Session Manager to Connect to Private Resources: Leveraging CDK and the `start-session` command
](https://medium.com/@mylesloffler/using-aws-ssm-session-manager-to-connect-to-private-resources-a0933b4dc6e3)

Please see this story as a guide for using this branch of this repository.

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
│   ├── stack.BastionHost.ts
│   └── stack.Networking.ts
├── package-lock.json
├── package.json
├── test
│   └── using-session-manager.test.ts
└── tsconfig.json

4 directories, 11 files
```

# The Stacks
of several stacks to allow for modular deployment.

The stacks are:

 - Networking (required for all stories)
 - BastionHost

The exact stacks and resources will vary per story.

>[!WARNING]
> Several of the resources launched by this example are billed based on the time they are provisined.
>
> Free Tier eligible resources are used wherever possible, but none of these
> resources exist in the Always Free Tier and will eventually become paid.
>
> This solution will cost approximately $18/month to run.
>
> **You should delete your CloudFormation stacks associated with this repository
> when you are done with them to avoid unexpected bills**
