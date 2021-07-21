import * as AWS from 'aws-sdk';
import { createAwsClient } from './aws';

export async function getResourceDefinitonFromRegistry(name: string, _version?: string): Promise<AWS.CloudFormation.DescribeTypeOutput> {
  const cfn = createAwsClient(AWS.CloudFormation);

  const types = [];
  let token;
  do {
    const res: AWS.CloudFormation.ListTypesOutput = await cfn.listTypes({
      NextToken: token,
      Filters: {
        Category: 'THIRD_PARTY',
        TypeNamePrefix: name,
      },
      Visibility: 'PUBLIC',
    }).promise();
    if (res.TypeSummaries) {
      types.push(...res.TypeSummaries);
    }
    token = res.NextToken;
  } while (token);

  console.log(types);

  // TODO versioning

  if (types.length !== 1) {
    throw new Error('Cannot find unique CloudFormation Type ' + name);
  }

  const type = await cfn.describeType({
    Arn: types[0].TypeArn,
  }).promise();
  return type;
}
