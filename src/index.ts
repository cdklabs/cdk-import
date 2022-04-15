import * as fs from 'fs';
import * as path from 'path';
import { describeResourceType, DescribeResourceTypeOptions } from './cfn-registry';
import { CfnResourceGenerator } from './cfn-resource-generator';
import { DescribeProductAggregateOptions, describeProductAggregate, ProductDataAggregate, fetchAvailableProducts } from './service-catalog';

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

export interface ImportProductOptions extends DescribeProductAggregateOptions {
  /**
   * @default "./sc-products"
   */
  readonly outdir?: string;
}

/**
 * Entry point to import Service Catalog provisioned product resource
 *
 * @param outdir the out folder to use (defaults to the current directory under a 'sc-products' folder)
 * @returns the name of the provisioned product version
 */
export async function importProduct(options: ImportProductOptions): Promise<string> {
  const outdir = options.outdir ?? '.';

  await describeProductAggregate(options);

  //TODO CodeGen

  return outdir; //just for typechecking
};

/**
 * Entry point to import all available Service Catalog provisioned product resources with `DEFAULT` paramaters.
 *
 * @param outdir the out folder to use (defaults to the current directory under a 'sc-products' folder)
 * @returns the names of the provisioned product versions
 */
export async function importProducts(options: ImportProductOptions): Promise<string[]> {
  const outdir = options.outdir ?? '.';
  let productDataAggregrates: ProductDataAggregate[];

  const availableProducts = await fetchAvailableProducts();

  await Promise.all(availableProducts.map(async (product) => {
    const productDataAggregate = await describeProductAggregate( {
      productId: product.Id!,
    });
    productDataAggregrates.push(productDataAggregate);
  }));

  //TODO CodeGen

  return [outdir]; //just for typechecking
};
