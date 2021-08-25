import * as fs from 'fs';
import * as testee from '../src/cfn-resource-generator';
import { TypeInfo } from '../src/type-info';

test('should generate correct file for type', async () => {
  const typeInfo = JSON.parse(fs.readFileSync(__dirname + '/../playground/eks.json', { encoding: 'utf8' })) as TypeInfo;

  const gen = new testee.CfnResourceGenerator('AWSQS::EKS::Cluster', typeInfo, JSON.parse(typeInfo.Schema));

  expect(gen.render()).toMatchSnapshot();
});
