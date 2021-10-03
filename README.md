# cdk-import

> Generates CDK L1 constructs for public CloudFormation Registry types and modules.

NOTE: This is part of the implementation of [RFC](https://github.com/aws/aws-cdk-rfcs/pull/356)

## Installation

```shell
npm install -g cdk-import
```

## Usage

```shell

Usage:
  cdk-import -l LANGUAGE RESOURCE-NAME[@VERSION]

Options:
  -l, --language     Output programming language                       [string]
  -o, --outdir       Output directory                                  [string]  [default: "."]
  --go-module-name   Module name (required if language is "golang")    [string]
  -h, --help         Show this usage info                              [boolean]
```

The `--language` option specifies the output programming language. Supported
languages: `typescript`, `java`, `python`, `csharp` and `golang`. If `golang` is
used, the `--go-module-name` option is required and should specify the qualified
project module name (e.g. `github.com/myorg/myproject`).

## Examples

Generates constructs for the latest version AWSQS::EKS::Cluster in TypeScript:

```shell
cdk-import -l typescript AWSQS::EKS::Cluster
```

Generates construct in Go for a specific resource version:

```shell
cdk-import -l golang --go-module-name "github.com/account/repo" AWSQS::EKS::Cluster@1.2.0
```

Generates construct in Python under the "src" subfolder instead of working directory:

```shell
cdk-import -l python -o src AWSQS::EKS::Cluster
```

Generates construct in Java and identifies the resource type by its ARN:

```shell
cdk-import -l java arn:aws:cloudformation:...
```

Modules are also supported:

```shell
cdk-import AWSQS::CheckPoint::CloudGuardQS::MODULE
```

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.
