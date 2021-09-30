# cdk-import

> Generates CDK L1 constructs for public CloudFormation Registry types and modules.

NOTE: This is part of the implementation of [RFC](https://github.com/aws/aws-cdk-rfcs/pull/356)

## Installation

```shell
npm install -g cdk-import
```

## Usage

```shell
$ cdk-import --help
Usage: cdk-import RESOURCE-NAME[@VERSION]

Options:
  -o, --outdir       Output directory      [string]  [default: "."]
  -h, --help         Show this usage info  [boolean] [default: false]

Examples:
  cdk-import AWSQS::EKS::Cluster             Generates an L1 construct for the latest version of this resource under awsqs-eks-cluster.ts
  cdk-import AWSQS::EKS::Cluster@1.2.0       Generates an L1 construct for a specific version
```

This command will query the AWS CloudFormation Registry and will generate L1 constructs for the specified resource. If a version
is not specified, the latest version will be selected. Otherwise, the specific version will be used.

For example:

```shell
cdk-import AWSQS::EKS::Cluster
```

<details>
  <summary>awsqs-eks-cluster.ts</summary>

```ts
import * as cdk from '@aws-cdk/core';

/**
 * A resource that creates Amazon Elastic Kubernetes Service (Amazon EKS) clusters.
 *
 * @schema CfnClusterProps
 */
export interface CfnClusterProps {
  /**
   * A unique name for your cluster.
   *
   * @schema CfnClusterProps#Name
   */
  readonly name?: string;

  /**
   * Amazon Resource Name (ARN) of the AWS Identity and Access Management (IAM) role. This provides permissions for Amazon EKS to call other AWS APIs.
   *
   * @schema CfnClusterProps#RoleArn
   */
  readonly roleArn: string;

  /**
   * Name of the AWS Identity and Access Management (IAM) role used for clusters that have the public endpoint disabled. this provides permissions for Lambda to be invoked and attach to the cluster VPC
   *
   * @schema CfnClusterProps#LambdaRoleName
   */
  readonly lambdaRoleName?: string;

  /**
   * Desired Kubernetes version for your cluster. If you don't specify this value, the cluster uses the latest version from Amazon EKS.
   *
   * @schema CfnClusterProps#Version
   */
  readonly version?: string;

  /**
   * Network configuration for Amazon EKS cluster.
   *
   *
   *
   * @schema CfnClusterProps#KubernetesNetworkConfig
   */
  readonly kubernetesNetworkConfig?: CfnClusterPropsKubernetesNetworkConfig;

  /**
   * An object that represents the virtual private cloud (VPC) configuration to use for an Amazon EKS cluster.
   *
   * @schema CfnClusterProps#ResourcesVpcConfig
   */
  readonly resourcesVpcConfig: CfnClusterPropsResourcesVpcConfig;

  /**
   * Enables exporting of logs from the Kubernetes control plane to Amazon CloudWatch Logs. By default, logs from the cluster control plane are not exported to CloudWatch Logs. The valid log types are api, audit, authenticator, controllerManager, and scheduler.
   *
   * @schema CfnClusterProps#EnabledClusterLoggingTypes
   */
  readonly enabledClusterLoggingTypes?: string[];

  /**
   * Encryption configuration for the cluster.
   *
   * @schema CfnClusterProps#EncryptionConfig
   */
  readonly encryptionConfig?: EncryptionConfigEntry[];

  /**
   * @schema CfnClusterProps#KubernetesApiAccess
   */
  readonly kubernetesApiAccess?: CfnClusterPropsKubernetesApiAccess;

  /**
   * @schema CfnClusterProps#Tags
   */
  readonly tags?: CfnClusterPropsTags[];

}

/**
 * Converts an object of type 'CfnClusterProps' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_CfnClusterProps(obj: CfnClusterProps | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'Name': obj.name,
    'RoleArn': obj.roleArn,
    'LambdaRoleName': obj.lambdaRoleName,
    'Version': obj.version,
    'KubernetesNetworkConfig': toJson_CfnClusterPropsKubernetesNetworkConfig(obj.kubernetesNetworkConfig),
    'ResourcesVpcConfig': toJson_CfnClusterPropsResourcesVpcConfig(obj.resourcesVpcConfig),
    'EnabledClusterLoggingTypes': obj.enabledClusterLoggingTypes?.map(y => y),
    'EncryptionConfig': obj.encryptionConfig?.map(y => toJson_EncryptionConfigEntry(y)),
    'KubernetesApiAccess': toJson_CfnClusterPropsKubernetesApiAccess(obj.kubernetesApiAccess),
    'Tags': obj.tags?.map(y => toJson_CfnClusterPropsTags(y)),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * Network configuration for Amazon EKS cluster.
 *
 *
 *
 * @schema CfnClusterPropsKubernetesNetworkConfig
 */
export interface CfnClusterPropsKubernetesNetworkConfig {
  /**
   * Specify the range from which cluster services will receive IPv4 addresses.
   *
   * @schema CfnClusterPropsKubernetesNetworkConfig#ServiceIpv4Cidr
   */
  readonly serviceIpv4Cidr?: string;

}

/**
 * Converts an object of type 'CfnClusterPropsKubernetesNetworkConfig' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_CfnClusterPropsKubernetesNetworkConfig(obj: CfnClusterPropsKubernetesNetworkConfig | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'ServiceIpv4Cidr': obj.serviceIpv4Cidr,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * An object that represents the virtual private cloud (VPC) configuration to use for an Amazon EKS cluster.
 *
 * @schema CfnClusterPropsResourcesVpcConfig
 */
export interface CfnClusterPropsResourcesVpcConfig {
  /**
   * Specify one or more security groups for the cross-account elastic network interfaces that Amazon EKS creates to use to allow communication between your worker nodes and the Kubernetes control plane. If you don't specify a security group, the default security group for your VPC is used.
   *
   * @schema CfnClusterPropsResourcesVpcConfig#SecurityGroupIds
   */
  readonly securityGroupIds?: string[];

  /**
   * Specify subnets for your Amazon EKS worker nodes. Amazon EKS creates cross-account elastic network interfaces in these subnets to allow communication between your worker nodes and the Kubernetes control plane.
   *
   * @schema CfnClusterPropsResourcesVpcConfig#SubnetIds
   */
  readonly subnetIds: string[];

  /**
   * Set this value to false to disable public access to your cluster's Kubernetes API server endpoint. If you disable public access, your cluster's Kubernetes API server can only receive requests from within the cluster VPC. The default value for this parameter is true , which enables public access for your Kubernetes API server.
   *
   * @schema CfnClusterPropsResourcesVpcConfig#EndpointPublicAccess
   */
  readonly endpointPublicAccess?: boolean;

  /**
   * Set this value to true to enable private access for your cluster's Kubernetes API server endpoint. If you enable private access, Kubernetes API requests from within your cluster's VPC use the private VPC endpoint. The default value for this parameter is false , which disables private access for your Kubernetes API server. If you disable private access and you have worker nodes or AWS Fargate pods in the cluster, then ensure that publicAccessCidrs includes the necessary CIDR blocks for communication with the worker nodes or Fargate pods.
   *
   * @schema CfnClusterPropsResourcesVpcConfig#EndpointPrivateAccess
   */
  readonly endpointPrivateAccess?: boolean;

  /**
   * The CIDR blocks that are allowed access to your cluster's public Kubernetes API server endpoint. Communication to the endpoint from addresses outside of the CIDR blocks that you specify is denied. The default value is 0.0.0.0/0 . If you've disabled private endpoint access and you have worker nodes or AWS Fargate pods in the cluster, then ensure that you specify the necessary CIDR blocks.
   *
   * @schema CfnClusterPropsResourcesVpcConfig#PublicAccessCidrs
   */
  readonly publicAccessCidrs?: string[];

}

/**
 * Converts an object of type 'CfnClusterPropsResourcesVpcConfig' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_CfnClusterPropsResourcesVpcConfig(obj: CfnClusterPropsResourcesVpcConfig | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'SecurityGroupIds': obj.securityGroupIds?.map(y => y),
    'SubnetIds': obj.subnetIds?.map(y => y),
    'EndpointPublicAccess': obj.endpointPublicAccess,
    'EndpointPrivateAccess': obj.endpointPrivateAccess,
    'PublicAccessCidrs': obj.publicAccessCidrs?.map(y => y),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * The encryption configuration for the cluster.
 *
 * @schema EncryptionConfigEntry
 */
export interface EncryptionConfigEntry {
  /**
   * Specifies the resources to be encrypted. The only supported value is \\"secrets\\".
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
 * Converts an object of type 'EncryptionConfigEntry' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_EncryptionConfigEntry(obj: EncryptionConfigEntry | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'Resources': obj.resources?.map(y => y),
    'Provider': toJson_Provider(obj.provider),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * @schema CfnClusterPropsKubernetesApiAccess
 */
export interface CfnClusterPropsKubernetesApiAccess {
  /**
   * @schema CfnClusterPropsKubernetesApiAccess#Roles
   */
  readonly roles?: KubernetesApiAccessEntry[];

  /**
   * @schema CfnClusterPropsKubernetesApiAccess#Users
   */
  readonly users?: KubernetesApiAccessEntry[];

}

/**
 * Converts an object of type 'CfnClusterPropsKubernetesApiAccess' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_CfnClusterPropsKubernetesApiAccess(obj: CfnClusterPropsKubernetesApiAccess | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'Roles': obj.roles?.map(y => toJson_KubernetesApiAccessEntry(y)),
    'Users': obj.users?.map(y => toJson_KubernetesApiAccessEntry(y)),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * @schema CfnClusterPropsTags
 */
export interface CfnClusterPropsTags {
  /**
   * @schema CfnClusterPropsTags#Value
   */
  readonly value: string;

  /**
   * @schema CfnClusterPropsTags#Key
   */
  readonly key: string;

}

/**
 * Converts an object of type 'CfnClusterPropsTags' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_CfnClusterPropsTags(obj: CfnClusterPropsTags | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'Value': obj.value,
    'Key': obj.key,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

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
 * Converts an object of type 'Provider' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_Provider(obj: Provider | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'KeyArn': obj.keyArn,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

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

/**
 * Converts an object of type 'KubernetesApiAccessEntry' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_KubernetesApiAccessEntry(obj: KubernetesApiAccessEntry | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'Arn': obj.arn,
    'Username': obj.username,
    'Groups': obj.groups?.map(y => y),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */


/**
 * A CloudFormation \`AWSQS::EKS::Cluster\`
 *
 * @cloudformationResource AWSQS::EKS::Cluster
 * @stability external
 * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
 */
export class CfnCluster extends cdk.CfnResource {
  /**
  * The CloudFormation resource type name for this resource class.
  */
  public static readonly CFN_RESOURCE_TYPE_NAME = \\"AWSQS::EKS::Cluster\\";

  /**
   * \`AWSQS::EKS::Cluster.Name\`
   * A unique name for your cluster.
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly name: string | undefined;
  /**
   * \`AWSQS::EKS::Cluster.RoleArn\`
   * Amazon Resource Name (ARN) of the AWS Identity and Access Management (IAM) role. This provides permissions for Amazon EKS to call other AWS APIs.
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly roleArn: string;
  /**
   * \`AWSQS::EKS::Cluster.LambdaRoleName\`
   * Name of the AWS Identity and Access Management (IAM) role used for clusters that have the public endpoint disabled. this provides permissions for Lambda to be invoked and attach to the cluster VPC
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly lambdaRoleName: string | undefined;
  /**
   * \`AWSQS::EKS::Cluster.Version\`
   * Desired Kubernetes version for your cluster. If you don't specify this value, the cluster uses the latest version from Amazon EKS.
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly version: string | undefined;
  /**
   * \`AWSQS::EKS::Cluster.KubernetesNetworkConfig\`
   * Network configuration for Amazon EKS cluster.
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly kubernetesNetworkConfig: any | undefined;
  /**
   * \`AWSQS::EKS::Cluster.ResourcesVpcConfig\`
   * An object that represents the virtual private cloud (VPC) configuration to use for an Amazon EKS cluster.
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly resourcesVpcConfig: any;
  /**
   * \`AWSQS::EKS::Cluster.EnabledClusterLoggingTypes\`
   * Enables exporting of logs from the Kubernetes control plane to Amazon CloudWatch Logs. By default, logs from the cluster control plane are not exported to CloudWatch Logs. The valid log types are api, audit, authenticator, controllerManager, and scheduler.
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly enabledClusterLoggingTypes: string[] | undefined;
  /**
   * \`AWSQS::EKS::Cluster.EncryptionConfig\`
   * Encryption configuration for the cluster.
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly encryptionConfig: EncryptionConfigEntry[] | undefined;
  /**
   * \`AWSQS::EKS::Cluster.KubernetesApiAccess\`
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly kubernetesApiAccess: any | undefined;
  /**
   * \`AWSQS::EKS::Cluster.Tags\`
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly tags: any[] | undefined;
  /**
   * Attribute \`AWSQS::EKS::Cluster.Arn\`
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly attrArn: string;
  /**
   * Attribute \`AWSQS::EKS::Cluster.Endpoint\`
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly attrEndpoint: string;
  /**
   * Attribute \`AWSQS::EKS::Cluster.ClusterSecurityGroupId\`
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly attrClusterSecurityGroupId: string;
  /**
   * Attribute \`AWSQS::EKS::Cluster.CertificateAuthorityData\`
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly attrCertificateAuthorityData: string;
  /**
   * Attribute \`AWSQS::EKS::Cluster.EncryptionConfigKeyArn\`
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly attrEncryptionConfigKeyArn: string;
  /**
   * Attribute \`AWSQS::EKS::Cluster.OIDCIssuerURL\`
   * @link https://github.com/aws-quickstart/quickstart-amazon-eks-cluster-resource-provider.git
   */
  public readonly attrOidcIssuerUrl: string;

  /**
   * Create a new \`AWSQS::EKS::Cluster\`.
   *
   * @param scope - scope in which this resource is defined
   * @param id    - scoped id of the resource
   * @param props - resource properties
   */
  constructor(scope: cdk.Construct, id: string, props: CfnClusterProps) {
    super(scope, id, { type: CfnCluster.CFN_RESOURCE_TYPE_NAME, properties: toJson_CfnClusterProps(props)! });

    this.name = props.name;
    this.roleArn = props.roleArn;
    this.lambdaRoleName = props.lambdaRoleName;
    this.version = props.version;
    this.kubernetesNetworkConfig = props.kubernetesNetworkConfig;
    this.resourcesVpcConfig = props.resourcesVpcConfig;
    this.enabledClusterLoggingTypes = props.enabledClusterLoggingTypes;
    this.encryptionConfig = props.encryptionConfig;
    this.kubernetesApiAccess = props.kubernetesApiAccess;
    this.tags = props.tags;
    this.attrArn = cdk.Token.asString(this.getAtt('Arn'));
    this.attrEndpoint = cdk.Token.asString(this.getAtt('Endpoint'));
    this.attrClusterSecurityGroupId = cdk.Token.asString(this.getAtt('ClusterSecurityGroupId'));
    this.attrCertificateAuthorityData = cdk.Token.asString(this.getAtt('CertificateAuthorityData'));
    this.attrEncryptionConfigKeyArn = cdk.Token.asString(this.getAtt('EncryptionConfigKeyArn'));
    this.attrOidcIssuerUrl = cdk.Token.asString(this.getAtt('OIDCIssuerURL'));
  }
}
```

</details>
  
Modules are also supported:

```shell
$ cdk-import AWSQS::CheckPoint::CloudGuardQS::MODULE
awsqs-checkpoint-cloudguardqs-module.ts
```

## Roadmap

- [x] Use `jsii-srcmak` to allow generating sources in multiple languages (first version only supports TypeScript).
- [ ] Allow library usage

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.
