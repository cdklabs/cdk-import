#!/usr/bin/env node
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import minimist from 'minimist';
import { importResourceType } from '.';
import { renderCode, SUPPORTED_LANGUAGES } from './languages';

const args = minimist(process.argv.slice(2), {
  string: [
    'outdir',
    'language',
    'go-module-name',
  ],
  boolean: [
    'help',
    'private',
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
  console.log('  -l, --language     Output programming language                            [string]');
  console.log('  -o, --outdir       Output directory                                       [string]  [default: "."]');
  console.log('  --go-module        Go module name (required if language is "golang")      [string]');
  console.log('  --java-package     Java package name (required if language is "java")     [string]');
  console.log('  --private          Import types registered in your AWS account and region [boolean]');
  console.log('  -h, --help         Show this usage info                                   [boolean]');
  console.log('');
  console.log('Examples:');
  console.log();
  console.log('  Generates constructs for the latest version AWSQS::EKS::Cluster in TypeScript:');
  console.log('    cdk-import -l typescript AWSQS::EKS::Cluster');
  console.log();
  console.log('  Generates construct in Go for a specific resource version:');
  console.log('    cdk-import -l golang --go-module "github.com/account/repo" AWSQS::EKS::Cluster@1.2.0');
  console.log();
  console.log('  Generates construct in Python under the "src" subfolder instead of working directory:');
  console.log('    cdk-import -l python -o src AWSQS::EKS::Cluster');
  console.log();
  console.log('  Generates construct in Java and identifies the resource type by its ARN:');
  console.log('    cdk-import -l java --java-package "com.acme.myproject" arn:aws:cloudformation:...');
  console.log();
  console.log('  Generates construct for a private type:');
  console.log('    cdk-import -l typescript --private Acme::SuperService::Friend::MODULE');
  console.log();
}

void (async () => {
  if (args.help || args._.length !== 1) {
    showHelp();
    process.exit(1);
  }

  if (!args.language) {
    throw new Error(`Missing required option: --language. Supported languages: ${SUPPORTED_LANGUAGES.join(',')}`);
  }

  if (SUPPORTED_LANGUAGES.indexOf(args.language) === -1) {
    throw new Error(`Unsupported language ${args.language}. Supported: ${SUPPORTED_LANGUAGES.join(',')}`);
  }

  try {
    const [resourceName, resourceVersion] = args._[0].split('@');
    const workdir = await fs.mkdtemp(path.join(os.tmpdir(), 'cdk-import'));
    const typeName = await importResourceType(resourceName, resourceVersion, {
      outdir: workdir,
      private: args.private,
    });

    await renderCode({
      srcdir: workdir,
      language: args.language,
      outdir: args.outdir ?? '.',
      typeName: typeName,
      goModule: args['go-module'],
      javaPacakge: args['java-package'],
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
