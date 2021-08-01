import * as fs from 'fs';
// import * as os from 'os';
import * as path from 'path';
import { describeResourceType } from './cfn-registry';
import { CfnResourceGenerator } from './cfn-resource-generator';

export async function importResourceType(resourceName: string, resourceVersion: string, outdir: string = 'src') {
  console.log(resourceName);
  console.log(resourceVersion);
  console.log(outdir);

  const type = await describeResourceType(resourceName, resourceVersion);
  console.log(type);

  const typeSchema = JSON.parse(type.Schema!);

  const gen = new CfnResourceGenerator(resourceName, type, typeSchema);

  fs.writeFileSync(path.join(outdir, `${resourceName.replace(/::/g, '-').toLowerCase()}.ts`), gen.render());
};
