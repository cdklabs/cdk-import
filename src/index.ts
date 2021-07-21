import * as fs from 'fs';
// import * as os from 'os';
import * as path from 'path';
import * as minimist from 'minimist';
import { getResourceDefinitonFromRegistry } from './cfn-registry';
import { L1Generator } from './l1-generator';

const args = minimist(process.argv.slice(2), {
  string: [
    'outdir',
  ],
  alias: {
    outdir: 'o',
  },
});

void (async () => {
  if (args._.length !== 1) {
    console.log('Please specify a resource name');
    process.exit(1);
  }
  try {
    const [resourceName, resourceVersion] = args._[0].split('@');
    const outdir = args.outdir ?? 'src';
    console.log(resourceName);
    console.log(resourceVersion);
    console.log(outdir);

    const type = await getResourceDefinitonFromRegistry(resourceName, resourceVersion);
    console.log(type);

    const typeSchema = JSON.parse(type.Schema!);

    const gen = new L1Generator(resourceName, type, typeSchema);

    fs.writeFileSync(path.join(outdir, `${resourceName.replace(/::/g, '-').toLowerCase()}.ts`), gen.render());
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
