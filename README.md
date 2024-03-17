# Welcome

This project is intended to be used alongside my series of Medium stories under
umbrella title:

"Using AWS Session Manager to Connec to Remote, Private Resources"

At this time, it covers:

 - Connecting to a private EC2 instance using AWS Session Manager
 - (Coming Soon) Leveraging Session Manager Port Forwarding to connect to a private database

The project structure is reflective of `cdk init app --languge=typescript` and is comprised
of several stacks to allow for modular deployment.

The stacks are:

 - Networking (required for all stories)
 - BastionHost
 - AuroraDB

Each story will explain specifically which stacks are necessary

>[!WARNING]
> Several of the resources launched by this example (e.g., the EC2 instance and
> Aurora RDS Cluster) are billed based on the time they are provisined.
> Free Tier eligible resources are used wherever possible, but none of these
> resources exist in the Always Free Tier and will eventually become paid.
>
> **You should delete your CloudFormation stacks associated with this repository
> when you are done with them to avoid unexpected bills**

Please see the following Medium stories as guides for using this repository:

 - [Using AWS SSM Session Manager to Connect to Private Resources: Leveraging the `start-session` command](https://medium.com/@mylesloffler/using-aws-ssm-session-manager-to-connect-to-private-resources-a0933b4dc6e3)
 - (Coming soon)
