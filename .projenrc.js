const { typescript } = require('projen');
const project = new typescript.TypeScriptProject({
  name: 'cdk-import',
  description: 'Toolkit to import CFN resource types and generate L1 constructs',
  defaultReleaseBranch: 'main',
  deps: [
    'json2jsii',
    'aws-cdk-lib',
    'aws-sdk',
    'constructs@^10',
    'minimist',
    'minimist-subcommand',
    'proxy-agent',
    'case',
    'jsii-srcmak',
  ],
  devDeps: [
    'jsii',
    'ts-node',
    'aws-cdk-lib',
    'constructs@^10',
  ],
  bin: {
    'cdk-import': 'lib/cli.js',
  },
  tsconfig: {
    compilerOptions: {
      skipLibCheck: true,
    },
  },

  minNodeVersion: '14.17.0',

  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  autoApproveUpgrades: true,
  autoApproveOptions: { allowedUsernames: ['cdklabs-automation'], secret: 'GITHUB_TOKEN' },
});
project.release.publisher.publishToNpm();
project.addGitIgnore('/.tmp/');
project.addPackageIgnore('/.tmp/');

// we use jsii for testing, and the current jsii
// compiles projects with typescript < 4.0, which
// conflicts with @types/prettier
project.package.addField('resolutions', {
  '@types/prettier': '2.6.0',
});

project.synth();
