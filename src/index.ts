import * as fs from 'fs';
import * as path from 'path';
import * as caseutil from 'case';
import { describeResourceType, DescribeResourceTypeOptions } from './cfn-registry';
import { CfnResourceGenerator } from './cfn-resource-generator';
import { ServiceCatalogProvisioningConstructGenerator } from './sc-construct-generator';
import { describeProductAggregate, DescribeProductAggregateOptions, fetchAvailableProducts } from './service-catalog';

export interface ImportResourceTypeOptions extends DescribeResourceTypeOptions {
  /**
   * @default "."
   */
  readonly outdir?: string;
}

/**
 * Entry point to import CFN resource types
 *
 * @param resourceName the name or ARN of the resource type
 * @param _resourceVersion the version of the resource type (ignored for now)
 * @param outdir the out folder to use (defaults to the current directory)
 * @returns name of the resource type
 */
export async function importResourceType(resourceName: string, _resourceVersion: string, options: ImportResourceTypeOptions): Promise<string> {
  const outdir = options.outdir ?? '.';
  const type = await describeResourceType(resourceName, options);

  const typeSchema = JSON.parse(type.Schema!);

  const gen = new CfnResourceGenerator(type.TypeName, type, typeSchema);

  fs.mkdirSync(outdir, { recursive: true });

  fs.writeFileSync(path.join(outdir, 'index.ts'), gen.render());

  return type.TypeName;
};

/**
 * Configure options for importing products into your local workspace
 */
export interface ImportProductOptions extends DescribeProductAggregateOptions {
  /**
   * The folder in which product constructs (as separate class files) will be output to.
   * @default "./sc-products"
   */
  readonly outdir?: string;
}

/**
 * Entry point to import Service Catalog product resource.
 *
 * @returns name of the product version
 */
export async function importProduct(options: ImportProductOptions): Promise<string> {
  const outdir = options.outdir ?? '.';

  const product = await describeProductAggregate(options);

  const gen = new ServiceCatalogProvisioningConstructGenerator(product);
  fs.mkdirSync(outdir, { recursive: true });
  const prodDir = fs.mkdirSync(path.join(outdir, caseutil.header(gen.name).toLowerCase()), { recursive: true });
  fs.writeFileSync(path.join(prodDir!, 'index.ts'), gen.render());

  return gen.name;
};

/**
 * Entry point to import all available Service Catalog product resources with `DEFAULT` parameters.
 *
 * @returns names of the product versions
 */
export async function importProducts(options: ImportProductOptions): Promise<string[]> {
  const outdir = options.outdir ?? '.';
  let productVersions: string[] = [];

  const availableProducts = await fetchAvailableProducts();

  await Promise.all(availableProducts.map(async (product) => {
    const productVersion = await importProduct( {
      outdir: outdir,
      productId: product.ProductId!,
    });
    productVersions.push(productVersion);
  }));

  return productVersions;
};
