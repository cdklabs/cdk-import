import { spawnSync } from 'child_process';
import * as fs from 'fs';
import { basename, join } from 'path';
import * as testee from '../src/cfn-resource-generator';
import { TypeInfo } from '../src/type-info';

const SAMPLES_DIR = join(__dirname, 'fixtures', 'samples');
const SAMPLE_FILES = fs.readdirSync(SAMPLES_DIR);
const JSII = require.resolve('jsii/bin/jsii');
const PKG = JSON.parse(fs.readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
const CORE_VERSION = PKG.devDependencies['aws-cdk-lib'];
const CONSTRUCTS_VERSION = PKG.devDependencies.constructs;

test.each(SAMPLE_FILES)('generate %s', async fixture => {
  const typeInfo = JSON.parse(fs.readFileSync(join(SAMPLES_DIR, fixture), { encoding: 'utf8' })) as TypeInfo;
  const gen = new testee.CfnResourceGenerator(typeInfo.TypeName, typeInfo, JSON.parse(typeInfo.Schema));
  const sourceFile = gen.render();
  expect(sourceFile).toMatchSnapshot();

  // now compile the generated code to make sure its valid
  const workdir = join(process.cwd(), '.tmp', basename(fixture, '.json'));
  fs.mkdirSync(workdir, { recursive: true });
  fs.writeFileSync(join(workdir, 'index.ts'), sourceFile);
  fs.writeFileSync(join(workdir, 'package.json'), JSON.stringify({
    name: 'test',
    main: 'index.js',
    types: 'index.d.ts',
    jsii: {
      outdir: 'dist',
    },
    version: '1.0.0',
    author: {
      name: 'Barney Rubble',
      email: 'b@rubble.com',
      url: 'http://barnyrubble.tumblr.com/',
    },
    license: 'UNLICENSED',
    peerDependencies: {
      'aws-cdk-lib': CORE_VERSION,
      'constructs': CONSTRUCTS_VERSION,
    },
    repository: {
      type: 'git',
      url: 'https://github.com/my/repo.git',
    },
  }, undefined, 2));

  console.log(`Compiling ${workdir}`);
  const ret = spawnSync(JSII, { cwd: workdir, stdio: 'inherit' });
  if (ret.error || ret.status !== 0) {
    throw new Error('compilation failed');
  }
});
