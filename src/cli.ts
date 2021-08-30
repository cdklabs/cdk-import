#!/usr/bin/env node
import * as minimist from 'minimist';
import { importResourceType } from '.';

const args = minimist(process.argv.slice(2), {
  string: [
    'outdir',
  ],
  boolean: [
    'help',
  ],
  alias: {
    outdir: 'o',
    help: 'h',
  },
});

function showHelp() {
  console.log('');
  console.log('Usage: cdk-import RESOURCE-NAME[@VERSION]');
  console.log('');
  console.log('Options:');
  console.log('  -o, --outdir       Output directory      [string]  [default: "."]');
  console.log('  -h, --help         Show this usage info  [boolean] [default: false]');
  console.log('');
  console.log('Examples:');
  console.log('  cdk-import AWSQS::EKS::Cluster             Generates an L1 construct for the latest version of this resource under awsqs-eks-cluster.ts');
  console.log('  cdk-import AWSQS::EKS::Cluster@1.2.0       Generates an L1 construct for a specific version');
  console.log('  cdk-import -o src AWSQS::EKS::Cluster      Generates an L1 construct in the src subfolder');
}

void (async () => {
  if (args.help || args._.length !== 1) {
    showHelp();
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
