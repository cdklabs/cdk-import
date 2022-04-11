import * as AWS from 'aws-sdk';
import { createAwsClient } from './aws';

export interface IServiceCatalogClient {
  searchProducts(input: AWS.ServiceCatalog.ListPortfoliosInput): Promise<AWS.ServiceCatalog.ListPortfoliosOutput>;
  listProvisioningArtifacts(input: AWS.ServiceCatalog.ListProvisioningArtifactsInput): Promise<AWS.ServiceCatalog.ListProvisioningArtifactsOutput>;
  listLaunchPaths(input: AWS.ServiceCatalog.ListLaunchPathsInput): Promise<AWS.ServiceCatalog.ListLaunchPathsOutput> ;
  describeProvisioningParameters(input: AWS.ServiceCatalog.DescribeProvisioningParametersInput):
  Promise<AWS.ServiceCatalog.DescribeProvisioningParametersOutput>;
}

export class ServiceCatalogClient implements IServiceCatalogClient {
  private readonly sc: AWS.ServiceCatalog;

  constructor() {
    this.sc = createAwsClient(AWS.ServiceCatalog);
  }

  public async searchProducts(input: AWS.ServiceCatalog.SearchProductsInput): Promise<AWS.ServiceCatalog.SearchProductsOutput> {
    return this.sc.searchProducts(input).promise();
  }

  public async listProvisioningArtifacts(input: AWS.ServiceCatalog.ListProvisioningArtifactsInput):
  Promise<AWS.ServiceCatalog.ListProvisioningArtifactsOutput> {
    return this.sc.listProvisioningArtifacts(input).promise();
  }

  public async listLaunchPaths(input: AWS.ServiceCatalog.ListLaunchPathsInput): Promise<AWS.ServiceCatalog.ListLaunchPathsOutput> {
    return this.sc.listLaunchPaths(input).promise();
  }

  public async describeProvisioningParameters(input: AWS.ServiceCatalog.DescribeProvisioningParametersInput):
  Promise<AWS.ServiceCatalog.DescribeProvisioningParametersOutput> {
    return this.sc.describeProvisioningParameters(input).promise();
  }
}

/**
 * Provide query values for a specific provisionable product.
 * If no specific IDs are declared for a product, we will use the set DEFAULT value for the provisioning artifact and launch path.
 */
export interface DescribeProvisionedProductOptions {
  /**
   * A client that performs calls to AWS Service Catalog. You can provide a mock here
   * for testing.
   */
  readonly client?: IServiceCatalogClient;

  /**
   * The product Id..
   */
  readonly productId?: string;

  /**
   * The provisioning artifact Id.
   */
  readonly provisioningArtifactId?: string;

  /**
   * The launch path Id.
   */
  readonly launchPathId?: string;
}

/**
 * Fetches the all the available or queried service catalog product(s) for the caller.
 *
 * @returns list of product view summaries
 */
export async function fetchAvailableProducts(options: DescribeProvisionedProductOptions = {}): Promise<AWS.ServiceCatalog.ProductViewSummaries> {
  const sc = options.client ?? new ServiceCatalogClient();

  const products = [];
  let token;

  do {
    const res: AWS.ServiceCatalog.SearchProductsOutput = await sc.searchProducts({
      PageToken: token,
      ...(options.productId ? { SourceProductId: options.productId } : {}),
    });

    if (res.ProductViewSummaries) {
      products.push(...res.ProductViewSummaries);
    }
    token = res.NextPageToken;
  } while (token);

  return products;
}

/**
 * Fetches the all the available or queried provisioning artifact(s) for the caller.
 *
 * @param productId the product to fetch provisioning artifacts for
 * @returns list of provisioning artifact details for a product
 */
export async function listProvisioningArtifacts(
  productId: string,
  options: DescribeProvisionedProductOptions = {}): Promise<AWS.ServiceCatalog.ProvisioningArtifactDetail[]> {
  const sc = options.client ?? new ServiceCatalogClient();

  const provisioningArtifacts: AWS.ServiceCatalog.ListProvisioningArtifactsOutput = await sc.listProvisioningArtifacts({
    ProductId: productId,
  });

  if ( options.provisioningArtifactId != null ) {
    return provisioningArtifacts.ProvisioningArtifactDetails!.filter(pa => pa.Id == options.provisioningArtifactId);
  } else {
    return provisioningArtifacts.ProvisioningArtifactDetails!;
  }
}

/**
 * Retrieves all the availalbe or queried launch path(s) for a product.
 *
 * @param productId the product to list launch paths for
 * @returns list of launchPathSummaries for a product
 */
export async function listLaunchPaths(
  productId: string,
  options: DescribeProvisionedProductOptions = {}):
  Promise<AWS.ServiceCatalog.LaunchPathSummaries> {
  const sc = options.client ?? new ServiceCatalogClient();

  const launchPaths = [];
  let token;

  do {
    const res: AWS.ServiceCatalog.ListLaunchPathsOutput = await sc.listLaunchPaths({
      ProductId: productId,
      PageToken: token,
    });

    if (res.LaunchPathSummaries) {
      launchPaths.push(...res.LaunchPathSummaries);
    }
    token = res.NextPageToken;
  } while (token);

  if ( options.launchPathId != null ) {
    return launchPaths.filter(lp => lp.Id == options.launchPathId);
  } else {
    return launchPaths;
  }
}

/**
 * Gets the information required to provision an artifact.
 * Includes information on inputs and outputs of the product.
 *
 * @param productId the product to get provisioning parameters for
 * @param provisioningArtifactId the provisioning artifact to get provisioning parameters for
 * @param launchPathId the launch path to get provisioning parameters for
 * @returns the provisoning parameters for an artifact
 */
export async function describeProvisioningParameters(productId: string, provisioningArtifactId: string, launchPathId: string,
  options: DescribeProvisionedProductOptions = {}):
  Promise<AWS.ServiceCatalog.DescribeProvisioningParametersOutput> {

  const sc = options.client ?? new ServiceCatalogClient();

  const provisioningParameters: AWS.ServiceCatalog.DescribeProvisioningParametersOutput = await sc.describeProvisioningParameters({
    ProductId: productId,
    ProvisioningArtifactId: provisioningArtifactId,
    PathId: launchPathId,
  });

  return provisioningParameters;
}