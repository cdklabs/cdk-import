import {
  DescribeProductCommandInput,
  DescribeProductCommandOutput,
  DescribeProvisioningParametersCommandInput,
  DescribeProvisioningParametersCommandOutput,
  LaunchPathSummary,
  ListPortfoliosCommandInput,
  ListPortfoliosCommandOutput,
  ProductViewSummary,
  ProvisioningArtifact,
  SearchProductsCommandInput,
  SearchProductsCommandOutput,
} from '@aws-sdk/client-service-catalog';

export interface IServiceCatalogClient {
  searchProducts(input: ListPortfoliosCommandInput): Promise<ListPortfoliosCommandOutput>;
  describeProvisioningParameters(input: DescribeProvisioningParametersCommandInput):
  Promise<DescribeProvisioningParametersCommandOutput>;
  describeProduct(input: DescribeProductCommandInput): Promise<DescribeProductCommandOutput>;
}

export class ServiceCatalogClient implements IServiceCatalogClient {
  private readonly sc: ServiceCatalogClient;

  constructor() {
    this.sc = new ServiceCatalogClient();
  }

  public async searchProducts(input: SearchProductsCommandInput): Promise<SearchProductsCommandOutput> {
    return this.sc.searchProducts(input);
  }

  public async describeProvisioningParameters(input: DescribeProvisioningParametersCommandInput):
  Promise<DescribeProvisioningParametersCommandOutput> {
    return this.sc.describeProvisioningParameters(input);
  }

  public async describeProduct(input: DescribeProductCommandInput): Promise<DescribeProductCommandOutput> {
    return this.sc.describeProduct(input);
  }
}

/**
 * Provide query values for a specific provisionable product.
 * If no specific IDs are declared for a product, we will use the set `DEFAULT` value for the provisioning artifact and launch path.
 */
export interface DescribeProductAggregateOptions {
  /**
   * A client that performs calls to AWS Service Catalog. You can provide a mock here
   * for testing.
   *
   * @default - A real Service Catalog client
   */
  readonly client?: IServiceCatalogClient;

  /**
   * The product Id.
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
 * Returns the provisioning artifact from list of available artifacts.
 * If no query artifact Id is provided, the artifact marked `DEFAULT` will be returned.
 * If no `DEFAULT` artifact exists, the most recently created artifact will be returned.
 *
 * @param provisioningArtifacts list of provisioning artifacts for a product
 * @param provisioningArtifactId query artifact Id
 * @returns provisioning artifact detail
 */
function resolveProvisioningArtifact(provisioningArtifacts: Array<ProvisioningArtifact>, provisioningArtifactId?: string):
ProvisioningArtifact {
  if (provisioningArtifactId) {
    const provisioningArtifact = provisioningArtifacts.filter(pa => pa.Id == provisioningArtifactId);
    if (provisioningArtifact.length == 0) {
      throw new Error(`Could not find specified provisioning artifact id: ${provisioningArtifactId}`);
    } else {
      return provisioningArtifact.pop()!;
    }
  } else {
    try {
      if (provisioningArtifacts.filter(pa => pa.Guidance == 'DEFAULT').length == 1) {
        return provisioningArtifacts.filter(pa => pa.Guidance == 'DEFAULT').pop()!;
      } else {
        return provisioningArtifacts.sort((a, b) => a.CreatedTime!.valueOf() - b.CreatedTime!.valueOf()).pop()!;
      }
    } catch {
      throw new Error('Unable to resolve default or latest provisioning artifact.');
    }
  }
}

/**
 * Returns the queried launch path from list of available launch paths.
 * @param launchPaths list of available launch paths for the product
 * @param launchPathId the query launch path's Id
 * @returns the launch path summary for the query launch path
 */
function resolveLaunchPath(launchPaths: Array<LaunchPathSummary>, launchPathId?: string): LaunchPathSummary {
  if (launchPathId) {
    const launchPath = launchPaths.filter(lp => lp.Id == launchPathId);
    if (launchPath.length == 0 ) {
      throw new Error(`Could not find specified launch path id: ${launchPathId}`);
    } else {
      return launchPath.pop()!;
    }

  } else if (launchPaths.length == 1) {
    return launchPaths.pop()!;
  } else {
    throw new Error('Unable to resolve between multiple launch paths.');
  }
}

/**
 * Fetches the all the available or queried service catalog product(s) for the caller.
 *
 * @returns list of product view summaries
 */
async function describeProduct(options: DescribeProductAggregateOptions): Promise<ProductDataAggregate> {
  const sc: IServiceCatalogClient = options.client ?? new ServiceCatalogClient();

  const describeProductResponse: DescribeProductCommandOutput = await sc.describeProduct({
    Id: options.productId,
  });
  validateProductData(options.productId!, describeProductResponse);

  const provisioningArtifact: ProvisioningArtifact = resolveProvisioningArtifact(describeProductResponse.ProvisioningArtifacts!,
    options.provisioningArtifactId);

  const launchPath: LaunchPathSummary = resolveLaunchPath(describeProductResponse.LaunchPaths!, options.launchPathId);

  const parameters: DescribeProvisioningParametersCommandOutput = await describeProvisioningParameters({
    productId: options.productId!,
    provisioningArtifactId: provisioningArtifact.Id!,
    launchPathId: launchPath.Id!,
    client: sc,
  });

  return {
    product: describeProductResponse.ProductViewSummary!,
    provisioningArtifact: provisioningArtifact,
    launchPath: launchPath,
    params: parameters,
  };
}

/**
 * Fetches all the available service catalog product(s) for the caller.
 *
 * @returns list of product view summaries
 */
export async function fetchAvailableProducts(client?: IServiceCatalogClient): Promise<Array<ProductViewSummary>> {
  const sc = client ?? new ServiceCatalogClient();

  const products: Array<ProductViewSummary> = [];
  let token;

  do {
    const res: SearchProductsCommandOutput = await sc.searchProducts({
      PageToken: token,
    });

    if (res.ProductViewSummaries) {
      products.push(...res.ProductViewSummaries);
    }
    token = res.NextPageToken;
  } while (token);

  return products;
}

/**
 * Gets the information required to provision an artifact.
 * Includes information on inputs and outputs of the product.
 *
 * @returns the provisoning parameters for an artifact
 */
export async function describeProvisioningParameters(options: DescribeProductAggregateOptions):
Promise<DescribeProvisioningParametersCommandOutput> {

  const sc = options.client ?? new ServiceCatalogClient();

  const provisioningParameters: DescribeProvisioningParametersCommandOutput = await sc.describeProvisioningParameters({
    ProductId: options.productId,
    ProvisioningArtifactId: options.provisioningArtifactId,
    PathId: options.launchPathId,
  });

  return provisioningParameters;
}

/**
 * Holds all the information needed to generate a product artifact to provision.
 */
export interface ProductDataAggregate {
  /**
   * Core product details.
   */
  readonly product: ProductViewSummary;
  /**
   * Details on the selected provisioning artifact for the product.
   * Represents the actual template that contains resources.
   */
  readonly provisioningArtifact: ProvisioningArtifact;
  /**
   * Details on the selected launch path for the product.
   * Represents the permissions/ability for end user to provision the product.
   */
  readonly launchPath: LaunchPathSummary;
  /**
   * Details on provisioning requirements for the provisioning artifact and launch path.
   * Holds information on the inputs and outputs for the downstream template.
   */
  readonly params: DescribeProvisioningParametersCommandOutput;
}

/**
 * Makes a series of calls to service catalog to get all information
 * required to provision a service catalog product.
 *
 * @returns ProductVersionData aggregate of provisioning artifact details.
 */
export async function describeProductAggregate(options: DescribeProductAggregateOptions): Promise<ProductDataAggregate> {
  const sc = options.client ?? new ServiceCatalogClient();

  const productDataAggregate = await describeProduct({
    productId: options.productId,
    launchPathId: options.launchPathId,
    provisioningArtifactId: options.provisioningArtifactId,
    client: sc,
  });

  return productDataAggregate;
}

function validateProductData(productId: string, product: DescribeProductCommandOutput): void {
  if (product.ProductViewSummary == undefined) {
    throw new Error(`Cannot resolve product details for ${productId}`);
  } else if (product.ProvisioningArtifacts == undefined) {
    throw new Error(`Cannot resolve provisioning artifacts for product: ${productId}`);
  } else if (product.LaunchPaths == undefined) {
    throw new Error(`Cannot resolve launch paths for product: ${productId}`);
  }
}