## cfn2ts

Generates CDK L1 constructs for AWS CloudFormation Registry resources and modules.

## Installation

```shell
$ npm install -g cdk-cfn2ts
```

## Usage

```shell
$ cdk-cfn2ts --help
Usage: cfn2ts RESOURCE-NAME[@VERSION]

Options:
  -o, --outdir       Output directory   [string] [default: "src"]

Examples:
  cfn2ts AWSQS::EKS::Cluster             Generates an L1 construct for the latest version of this resource under src/awsqs-eks.Cluster.ts
  cfn2ts AWSQS::EKS::Cluster@1.2.0       Generates an L1 construct for a specific version
```

This command will query the AWS CloudFormation Registry and will generate L1 constructs for the specified resource. If a version
is not specified, the latest version will be selected. Otherwise, the specific version will be used.

## Roadmap

- [ ] Use `jsii-srcmak` to allow generating sources in multiple languages (first version only supports TypeScript).
- [ ] Allow library usage

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.
