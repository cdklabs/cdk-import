import * as fs from 'fs';
import * as path from 'path';
import { describeResourceType } from './cfn-registry';
import { CfnResourceGenerator } from './cfn-resource-generator';
import { sanitizeFileName } from './util';

/**
 * Entry point to import CFN resource types
 *
 * @param resourceName the name of the resource type
 * @param resourceVersion the version of the resource type
 * @param outdir the out folder to use (defaults to src)
 */
export async function importResourceType(resourceName: string, resourceVersion: string, outdir: string = 'src') {
  const type = await describeResourceType(resourceName, resourceVersion);

  const typeSchema = JSON.parse(type.Schema!);

  const gen = new CfnResourceGenerator(resourceName, type, typeSchema);

  fs.writeFileSync(path.join(outdir, sanitizeFileName(resourceName)), gen.render());
};
