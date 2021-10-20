import * as fs from 'fs';
import { join } from 'path';
import * as testee from '../src/cfn-resource-generator';
import { TypeInfo } from '../src/type-info';

const SAMPLES_DIR = join(__dirname, 'fixtures', 'samples');
const SAMPLE_FILES = fs.readdirSync(SAMPLES_DIR);

test.each(SAMPLE_FILES)('generate %s', async fixture => {
  const typeInfo = JSON.parse(fs.readFileSync(join(SAMPLES_DIR, fixture), { encoding: 'utf8' })) as TypeInfo;
  const gen = new testee.CfnResourceGenerator(typeInfo.TypeName, typeInfo, JSON.parse(typeInfo.Schema));
  expect(gen.render()).toMatchSnapshot();
});
