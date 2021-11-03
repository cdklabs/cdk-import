import * as fs from 'fs';
import * as path from 'path';
import { describeResourceType, DescribeResourceTypeOptions } from './cfn-registry';
import { CfnResourceGenerator } from './cfn-resource-generator';

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
