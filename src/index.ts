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
 * @param outdir the out folder to use (defaults to the current directory)
 */
export async function importResourceType(resourceName: string, resourceVersion: string, outdir: string = '.') {
  const type = await describeResourceType(resourceName, resourceVersion);

  const typeSchema = JSON.parse(type.Schema!);

  const gen = new CfnResourceGenerator(resourceName, type, typeSchema);

  fs.mkdirSync(outdir, { recursive: true });

  fs.writeFileSync(path.join(outdir, sanitizeFileName(resourceName)), gen.render());
};
