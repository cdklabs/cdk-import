const { TypeScriptProject } = require('projen');
const project = new TypeScriptProject({
  name: 'cdk-import',
  description: 'Toolkit to import CFN resource types and generate L1 constructs',
  defaultReleaseBranch: 'main',
  deps: [
    'json2jsii',
    'aws-sdk',
    'minimist',
    'proxy-agent',
    'camelcase',
  ],
  devDeps: [
    '@aws-cdk/core',
    'ts-node',
    'aws-sdk-mock',
  ],
  bin: {
    'cfn-import': 'lib/cli.js',
  },
  tsconfig: {
    compilerOptions: {
      skipLibCheck: true,
    },
  },
});
project.synth();