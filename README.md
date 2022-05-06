# cdk-import

Generates CDK constructs from external sources such as public CloudFormation Registry types and
modules (L1s) as well as AWS Service Catalog product versions.

> **IMPORTANT** The AWS CDK CLI has feature called [`cdk import`](https://github.com/aws/aws-cdk/blob/master/packages/aws-cdk/README.md#cdk-import), which can be used to import ("adopt")
> existing resources into CloudFormation control, so that they can be mutated by CDK updates later.
> For more information on that feature, see the [CLI documentation on `cdk import`](https://github.com/aws/aws-cdk/blob/master/packages/aws-cdk/README.md#cdk-import).

## Installation

```shell
npm install -g cdk-import
```

## Usage

There are currently two sources that resources can be generated from. The subcommand 
`cfn` is used to import from CloudFormation Registry, 
`sc` is used to import AWS Service Catalog products.
There are shared general options for output directories and target language.
You will need `AWS_REGION` variable configured in your environment.

```shell
Usage:
  cdk-import SUBCOMMAND (cfn or sc) [parameters]

General Options:
  -l, --language     Output programming language                               [string]
  -o, --outdir       Output directory                                          [string]
  --go-module        Go module name (required if language is "golang")         [string]
  --java-package     Java package name (required if language is "java")        [string]
  --csharp-namespace C# namespace (optional if language is "csharp",           [string]
                     defaults to resource name.)
  -h, --help         Show usage info (include subcommand to see specific help) [boolean]
```

## CloudFormation Registry Usage

```shell
Usage:
  cdk-import cfn -l LANGUAGE RESOURCE-NAME[@VERSION]

Options:
  -l, --language     Output programming language                        [string]
  -o, --outdir       Output directory                                   [string]  [default: "."]
  --go-module        Module name (required if language is "golang")     [string]
  --java-package     Java package name (required if language is "java") [string]
  --csharp-namespace C# namespace (optional if language is "csharp",    [string]
                     defaults to resource name.)
  -h, --help         Show this usage info                               [boolean]
```

The `--language` option specifies the output programming language. Supported
languages: `typescript`, `java`, `python`, `csharp` and `golang`.

Output will be generated relative to `--outdir` which defaults to the current
working directory.

The following section describes language-specific behavior.

### Java

The `--java-package` option is required and should include the Java package name
to use for generated classes. Normally, this will be a sub-package of your
project's package.

Java source files are generates in Maven-compatible structure under
`$outdir/src/main/java/PACKAGE/` where `PACKAGE` is based on `--java-package`.

For example:

```shell
cdk-import -l java --java-package com.foo.bar.resources AWSQS::EKS::Cluster
```

Will generate class source files under `src/main/java/com/foo/bar/resources`.
All the classes will be under the package `com.foo.bar.resources`.

### Python

A Python submodule is generated under `$outdir/MODULE_NAME/` where `MODULE_NAME`
is based on the name of the resource (`AWSQS::EKS::Cluster` =>
`awsqs_eks_cluster`).

For example:

```shell
cdk-import -l python AWSQS::EKS::Cluster 
```

Will generate a subdirectory `awsqs_eks_cluster` with a Python module that can
be `import`ed.

### CSharp

A `.csproj` is generated under `$outdir/RESOURCE/` where `RESOURCE` is the
resource name (`AWSQS::EKS::Cluster`).

For example:

```shell
cdk-import -l csharp AWSQS::EKS::Cluster 
```

Will generate a directory `AWSQS::EKS::Cluster` with a `.csproj`. This can be
used in a .NET solution.

### TypeScript

A TypeScript file will be generated under `$outdir/MODULE` where `MODULE` is
derived from the resource name.

For example:

```shell
cdk-import -l typescript -o src AWSQS::EKS::Cluster
```

Will generate a file `src/awsqs-eks-cluster.ts` (note the usage of `-o` above).

### Go

If `-l golang` is used, the `--go-module` option is required and must reflect
the Go module name of the parent project module.

A Go submodule will be generated under `$outdir/PACKAGE` where `PACKAGE` is
derived from the resource name (`AWSQS::EKS::Cluster` => `awsqs-eks-cluster`).

For example:

```shell
cdk-import -l golang --go-module "github.com/foo/bar" AWSQS::EKS::Cluster
```

Will generate a Go module under: `awsqs-eks-cluster`.

## Examples

Generates constructs for the latest version AWSQS::EKS::Cluster in TypeScript:

```shell
cdk-import cfn -l typescript AWSQS::EKS::Cluster
```

Generates construct in Go for a specific resource version:

```shell
cdk-import cfn -l golang --go-module "github.com/account/repo" AWSQS::EKS::Cluster@1.2.0
```

Generates construct in Python under the "src" subfolder instead of working
directory:

```shell
cdk-import cfn -l python -o src AWSQS::EKS::Cluster
```

Generates construct in Java and identifies the resource type by its ARN:

```shell
cdk-import cfn -l java --java-package "com.acme.myproject" arn:aws:cloudformation:...
```

Modules are also supported:

```shell
cdk-import cfn AWSQS::CheckPoint::CloudGuardQS::MODULE
```

## AWS Service Catalog Usage

The cdk-import tool generates a user friendly version of a provisioned product that becomes 
a normal cdk construct that you can use within a cdk app.
You can currently either specify a specific product version or generate all available products.
The tool will call APIs and attempt to resolve default artifact and launch path for a product,
if a singular product version or launch path cannot be resolved, it will throw an error.
You will need Service Catalog end-user read permissions to call these APIs. 

```shell
Usage:
  cdk-import sc -l LANGUAGE
  cdk-import sc -l LANGUAGE --product-id PRODUCT-ID --provisioning-artifact-id PROVISIONING-ARTIFACT-ID --path-id LAUNCH-PATH-ID

Options:
  -l, --language                 Output programming language                          [string]
  -o, --outdir                   Output directory (default "./sc-products")           [string]
  --product-id                   Product Id                                           [string]
  --provisioning-artifact-id     Provisioning artifact Id                             [string]
  --path-id                      Launch path Id                                       [string]
  --go-module                    Module name (required if language is "golang")       [string]
  --java-package                 Java package name (required if language is "java")   [string]
  --csharp-namespace             C# namespace (optional if language is "csharp",      [string]
                                 defaults to resource name.)
  -h, --help                     Show this usage info                                 [boolean]
```

The `--language` option specifies the output programming language. Supported
languages: `typescript`, `java`, `python`, `csharp` and `golang`.

If you are using `csharp`, you must specify a `--csharp-namespace` within your project.

Output will be generated relative to `--outdir` which defaults to the current
working directory under `./sc-products`.

## Examples

Generates constructs in python for the latest product versions as importable modules in your local workspace.

```shell
cdk-import sc -l python -o .
```


## Contributing

See [CONTRIBUTING](CONTRIBUTING.md)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more
information.

## License

This project is licensed under the Apache-2.0 License.
