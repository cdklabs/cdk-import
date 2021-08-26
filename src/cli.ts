#!/usr/bin/env node
import * as minimist from 'minimist';
import { importResourceType } from '.';

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
    await importResourceType(resourceName, resourceVersion, args.outdir);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
