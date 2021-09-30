#!/usr/bin/env node
import * as os from 'os';
import * as path from 'path';
import * as minimist from 'minimist';
import { importResourceType } from '.';
import { renderCode, SUPPORTED_LANGUAGES } from './languages';


const args = minimist(process.argv.slice(2), {
  string: [
    'outdir',
    'language',
  ],
  boolean: [
    'help',
  ],
  alias: {
    outdir: 'o',
    help: 'h',
    language: 'l',
  },
});

function showHelp() {
  console.log('');
  console.log('Usage:');
  console.log('  cdk-import -l LANGUAGE RESOURCE-NAME[@VERSION]');
  console.log();
  console.log('Options:');
  console.log('  -l, --language     Output programming language      [string]');
  console.log('  -o, --outdir       Output directory                 [string]  [default: "."]');
  console.log('  -h, --help         Show this usage info             [boolean] [default: false]');
  console.log('');
  console.log('Examples:');
  console.log('  cdk-import -l typescript AWSQS::EKS::Cluster             Generates an L1 construct for the latest version of this resource under awsqs-eks-cluster.ts');
  console.log('  cdk-import -l golang AWSQS::EKS::Cluster@1.2.0               Generates an L1 construct for a specific version');
  console.log('  cdk-import -l python -o src AWSQS::EKS::Cluster      Generates an L1 construct in the src subfolder');
  console.log('  cdk-import -l java arn:aws:cloudformation:...      Generates an L1 construct and identifies the resource type by its ARN');
}

void (async () => {
  if (args.help || args._.length !== 1) {
    showHelp();
    process.exit(1);
  }

  if (!args.language) {
    console.error(`Missing required option: --language. Supported languages: ${SUPPORTED_LANGUAGES.join(',')}`);
  }

  if (SUPPORTED_LANGUAGES.indexOf(args.language) === -1) {
    throw new Error(`Unsupported language ${args.language}. Supported: ${SUPPORTED_LANGUAGES.join(',')}`);
  }

  try {
    const [resourceName, resourceVersion] = args._[0].split('@');
    const workdir = path.join(os.tmpdir(), 'cdk-import');
    const typeName = await importResourceType(resourceName, resourceVersion, workdir);
    await renderCode({
      srcdir: workdir,
      language: args.language,
      outdir: args.outdir ?? '.',
      typeName: typeName,
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
