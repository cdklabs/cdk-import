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
  ],
  bin: {
    'cfn-import': 'lib/index.js',
  },
  devDeps: [
    'ts-node',
  ],

});
project.synth();