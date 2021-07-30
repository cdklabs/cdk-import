import * as fs from 'fs';
// import * as os from 'os';
import * as path from 'path';
import { getResourceDefinitonFromRegistry } from './cfn-registry';
import { L1Generator } from './l1-generator';

export async function importResourceType(resourceName: string, resourceVersion: string, outdir: string = 'src') {
  console.log(resourceName);
  console.log(resourceVersion);
  console.log(outdir);

  const type = await getResourceDefinitonFromRegistry(resourceName, resourceVersion);
  console.log(type);

  const typeSchema = JSON.parse(type.Schema!);

  const gen = new L1Generator(resourceName, type, typeSchema);

  fs.writeFileSync(path.join(outdir, `${resourceName.replace(/::/g, '-').toLowerCase()}.ts`), gen.render());
};
