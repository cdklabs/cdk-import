const { TypeScriptProject } = require('projen');
const project = new TypeScriptProject({
  name: 'cdk-import',
  description: '',
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