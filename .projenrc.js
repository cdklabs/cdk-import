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
    'cdk-import': 'lib/cli.js',
  },
  tsconfig: {
    compilerOptions: {
      skipLibCheck: true,
    },
  },

  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  autoApproveUpgrades: true,
  autoApproveOptions: { allowedUsernames: ['cdklabs-automation'], secret: 'GITHUB_TOKEN' },
});
project.release.publisher.publishToNpm();

project.synth();