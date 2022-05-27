import * as fs from 'fs';
import * as path from 'path';
import * as caseutil from 'case';
import { describeResourceType, DescribeResourceTypeOptions } from './cfn-registry';
import { CfnResourceGenerator } from './cfn-resource-generator';
import { ServiceCatalogProvisioningConstructGenerator } from './sc-construct-generator';
import { describeProductAggregate, DescribeProductAggregateOptions, fetchAvailableProducts } from './service-catalog';
import { TypeInfo } from './type-info';

export interface ImportResourceTypeOptions extends DescribeResourceTypeOptions {
  /**
   * @default "."
   */
  readonly outdir?: string;
}

/**
 * Load the resource definition from the CFN registry
 */
export async function readResourceDefinitionFromRegistry(
  resourceName: string,
  _resourceVersion: string,
  options?: DescribeResourceTypeOptions): Promise<TypeInfo> {
  const type = await describeResourceType(resourceName, options);

  return {
    TypeName: resourceName,
    Schema: type.Schema,
    SourceUrl: type.SourceUrl,
  };
}

/**
 * Entry point to import CFN resource types
 *
 * @param typeInfo the schema and metadata information for the type
 * @param options options for code generation
 * @returns name of the resource type
 */
export function importResourceType(typeInfo: TypeInfo, options: ImportResourceTypeOptions): string {
  const gen = new CfnResourceGenerator(typeInfo.TypeName, typeInfo, JSON.parse(typeInfo.Schema));

  const outdir = options.outdir ?? '.';
  fs.mkdirSync(outdir, { recursive: true });
  fs.writeFileSync(path.join(outdir, 'index.ts'), gen.render());

  return typeInfo.TypeName;
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
    try {
      const productVersion = await importProduct({
        outdir: outdir,
        productId: product.ProductId!,
      });
      productVersions.push(productVersion);
    } catch (e) {
      console.log(`${(e as Error).message} Skipping import for ${product.ProductId}...`);
      console.log('try importing directly via --product-id, --provisioning-artifact-id, --path-id');
    }
  }));

  return productVersions;
};
