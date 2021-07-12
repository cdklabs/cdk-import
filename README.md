# WORK IN PROGRESS 
This is part of the implementation of [RFC](https://github.com/aws/aws-cdk-rfcs/pull/356)

# cdk-import

> Generates CDK L1 constructs for AWS CloudFormation Registry resources and modules.


## Installation

```shell
$ npm install -g cdk-import
```

## Usage

```shell
$ cdk-import --help
Usage: cdk-import RESOURCE-NAME[@VERSION]

Options:
  -o, --outdir       Output directory   [string] [default: "src"]

Examples:
  cfn2ts AWSQS::EKS::Cluster             Generates an L1 construct for the latest version of this resource under src/awsqs-eks.Cluster.ts
  cfn2ts AWSQS::EKS::Cluster@1.2.0       Generates an L1 construct for a specific version
```

This command will query the AWS CloudFormation Registry and will generate L1 constructs for the specified resource. If a version
is not specified, the latest version will be selected. Otherwise, the specific version will be used.

For example:

```shell
$ cdk-import AWSQS::EKS::Cluster
```

<details>
  <summary>src/awsqs-eks-cluster.ts</summary>

```ts
export class Cluster extends CfnResource {
  constructor(scope: Construct, id: string, props: ClusterProps) {
    super(scope, id, {
      type: 'AWSQS::EKS::Cluster',
      properties: capitalize(props),
    });
  }
}

// ---------------- output of json2jsii:
/**
 * A resource that creates Amazon Elastic Kubernetes Service (Amazon EKS) clusters.
 *
 * @schema ClusterProps
 */
export interface ClusterProps {
  /**
   * A unique name for your cluster.
   *
   * @schema ClusterProps#Name
   */
  readonly name?: string;
  /**
   * Amazon Resource Name (ARN) of the AWS Identity and Access Management (IAM) role. This provides permissions for Amazon EKS to call other AWS APIs.
   *
   * @schema ClusterProps#RoleArn
   */
  readonly roleArn?: string;
  /**
   * Name of the AWS Identity and Access Management (IAM) role used for clusters that have the public endpoint disabled. this provides permissions for Lambda to be invoked and attach to the cluster VPC
   *
   * @schema ClusterProps#LambdaRoleName
   */
  readonly lambdaRoleName?: string;
  /**
   * Desired Kubernetes version for your cluster. If you don't specify this value, the cluster uses the latest version from Amazon EKS.
   *
   * @schema ClusterProps#Version
   */
  readonly version?: string;
  /**
   * Network configuration for Amazon EKS cluster.
   *
   * @schema ClusterProps#KubernetesNetworkConfig
   */
  readonly kubernetesNetworkConfig?: ClusterPropsKubernetesNetworkConfig;
  /**
   * An object that represents the virtual private cloud (VPC) configuration to use for an Amazon EKS cluster.
   *
   * @schema ClusterProps#ResourcesVpcConfig
   */
  readonly resourcesVpcConfig?: ClusterPropsResourcesVpcConfig;
  /**
   * Enables exporting of logs from the Kubernetes control plane to Amazon CloudWatch Logs. By default, logs from the cluster control plane are not exported to CloudWatch Logs. The valid log types are api, audit, authenticator, controllerManager, and scheduler.
   *
   * @schema ClusterProps#EnabledClusterLoggingTypes
   */
  readonly enabledClusterLoggingTypes?: string[];
  /**
   * Encryption configuration for the cluster.
   *
   * @schema ClusterProps#EncryptionConfig
   */
  readonly encryptionConfig?: EncryptionConfigEntry[];
  /**
   * @schema ClusterProps#KubernetesApiAccess
   */
  readonly kubernetesApiAccess?: ClusterPropsKubernetesApiAccess;
  /**
   * ARN of the cluster (e.g., `arn:aws:eks:us-west-2:666666666666:cluster/prod`).
   *
   * @schema ClusterProps#Arn
   */
  readonly arn?: string;
  /**
   * Certificate authority data for your cluster.
   *
   * @schema ClusterProps#CertificateAuthorityData
   */
  readonly certificateAuthorityData?: string;
  /**
   * Security group that was created by Amazon EKS for your cluster. Managed-node groups use this security group for control-plane-to-data-plane communications.
   *
   * @schema ClusterProps#ClusterSecurityGroupId
   */
  readonly clusterSecurityGroupId?: string;
  /**
   * Endpoint for your Kubernetes API server (e.g., https://5E1D0CEXAMPLEA591B746AFC5AB30262.yl4.us-west-2.eks.amazonaws.com).
   *
   * @schema ClusterProps#Endpoint
   */
  readonly endpoint?: string;
  /**
   * ARN or alias of the customer master key (CMK).
   *
   * @schema ClusterProps#EncryptionConfigKeyArn
   */
  readonly encryptionConfigKeyArn?: string;
  /**
   * Issuer URL for the OpenID Connect identity provider.
   *
   * @schema ClusterProps#OIDCIssuerURL
   */
  readonly oidcIssuerUrl?: string;
  /**
   * @schema ClusterProps#Tags
   */
  readonly tags?: ClusterPropsTags[];
}
/**
 * Network configuration for Amazon EKS cluster.
 *
 * @schema ClusterPropsKubernetesNetworkConfig
 */
export interface ClusterPropsKubernetesNetworkConfig {
  /**
   * Specify the range from which cluster services will receive IPv4 addresses.
   *
   * @schema ClusterPropsKubernetesNetworkConfig#ServiceIpv4Cidr
   */
  readonly serviceIpv4Cidr?: string;
}
/**
 * An object that represents the virtual private cloud (VPC) configuration to use for an Amazon EKS cluster.
 *
 * @schema ClusterPropsResourcesVpcConfig
 */
export interface ClusterPropsResourcesVpcConfig {
  /**
   * Specify one or more security groups for the cross-account elastic network interfaces that Amazon EKS creates to use to allow communication between your worker nodes and the Kubernetes control plane. If you don't specify a security group, the default security group for your VPC is used.
   *
   * @schema ClusterPropsResourcesVpcConfig#SecurityGroupIds
   */
  readonly securityGroupIds?: string[];
  /**
   * Specify subnets for your Amazon EKS worker nodes. Amazon EKS creates cross-account elastic network interfaces in these subnets to allow communication between your worker nodes and the Kubernetes control plane.
   *
   * @schema ClusterPropsResourcesVpcConfig#SubnetIds
   */
  readonly subnetIds?: string[];
  /**
   * Set this value to false to disable public access to your cluster's Kubernetes API server endpoint. If you disable public access, your cluster's Kubernetes API server can only receive requests from within the cluster VPC. The default value for this parameter is true , which enables public access for your Kubernetes API server.
   *
   * @schema ClusterPropsResourcesVpcConfig#EndpointPublicAccess
   */
  readonly endpointPublicAccess?: boolean;
  /**
   * Set this value to true to enable private access for your cluster's Kubernetes API server endpoint. If you enable private access, Kubernetes API requests from within your cluster's VPC use the private VPC endpoint. The default value for this parameter is false , which disables private access for your Kubernetes API server. If you disable private access and you have worker nodes or AWS Fargate pods in the cluster, then ensure that publicAccessCidrs includes the necessary CIDR blocks for communication with the worker nodes or Fargate pods.
   *
   * @schema ClusterPropsResourcesVpcConfig#EndpointPrivateAccess
   */
  readonly endpointPrivateAccess?: boolean;
  /**
   * The CIDR blocks that are allowed access to your cluster's public Kubernetes API server endpoint. Communication to the endpoint from addresses outside of the CIDR blocks that you specify is denied. The default value is 0.0.0.0/0 . If you've disabled private endpoint access and you have worker nodes or AWS Fargate pods in the cluster, then ensure that you specify the necessary CIDR blocks.
   *
   * @schema ClusterPropsResourcesVpcConfig#PublicAccessCidrs
   */
  readonly publicAccessCidrs?: string[];
}
/**
 * The encryption configuration for the cluster.
 *
 * @schema EncryptionConfigEntry
 */
export interface EncryptionConfigEntry {
  /**
   * Specifies the resources to be encrypted. The only supported value is "secrets".
   *
   * @schema EncryptionConfigEntry#Resources
   */
  readonly resources?: string[];
  /**
   * @schema EncryptionConfigEntry#Provider
   */
  readonly provider?: Provider;
}
/**
 * @schema ClusterPropsKubernetesApiAccess
 */
export interface ClusterPropsKubernetesApiAccess {
  /**
   * @schema ClusterPropsKubernetesApiAccess#Roles
   */
  readonly roles?: KubernetesApiAccessEntry[];
  /**
   * @schema ClusterPropsKubernetesApiAccess#Users
   */
  readonly users?: KubernetesApiAccessEntry[];
}
/**
 * @schema ClusterPropsTags
 */
export interface ClusterPropsTags {
  /**
   * @schema ClusterPropsTags#Value
   */
  readonly value?: string;
  /**
   * @schema ClusterPropsTags#Key
   */
  readonly key?: string;
}
/**
 * AWS Key Management Service (AWS KMS) customer master key (CMK). Either the ARN or the alias can be used.
 *
 * @schema Provider
 */
export interface Provider {
  /**
   * Amazon Resource Name (ARN) or alias of the customer master key (CMK). The CMK must be symmetric, created in the same region as the cluster, and if the CMK was created in a different account, the user must have access to the CMK.
   *
   * @schema Provider#KeyArn
   */
  readonly keyArn?: string;
}
/**
 * @schema KubernetesApiAccessEntry
 */
export interface KubernetesApiAccessEntry {
  /**
   * @schema KubernetesApiAccessEntry#Arn
   */
  readonly arn?: string;
  /**
   * @schema KubernetesApiAccessEntry#Username
   */
  readonly username?: string;
  /**
   * @schema KubernetesApiAccessEntry#Groups
   */
  readonly groups?: string[];
}
```

</details>
  
Modules are also supported:

```shell
$ cdk-import AWSQS::CheckPoint::CloudGuardQS::MODULE
src/awsqs-checkpoint-cloudguardqs-module.ts
```

## Roadmap

- [ ] Use `jsii-srcmak` to allow generating sources in multiple languages (first version only supports TypeScript).
- [ ] Allow library usage

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.
