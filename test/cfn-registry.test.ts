import * as AWS from 'aws-sdk';
import * as AWSMock from 'aws-sdk-mock';
import * as testee from '../src/cfn-registry';

test('should return schema of single registry type', async () => {
  AWSMock.setSDKInstance(AWS);

  const typeName = 'Test::Resource::Type';
  const typeArn = 'arn:aws:cloudformation:eu-central-1::type/resource/Test-Resource-Type';

  AWSMock.mock('CloudFormation', 'listTypes', (params: AWS.CloudFormation.ListTypesInput, cb) => {
    expect(params.Filters!.TypeNamePrefix).toBe(typeName);
    cb(null, {
      TypeSummaries: [{
        TypeName: typeName,
        TypeArn: typeArn,
      }],
    });
  });
  AWSMock.mock('CloudFormation', 'describeType', (params: AWS.CloudFormation.DescribeTypeInput, cb) => {
    expect(params.Arn).toBe(typeArn);
    cb(null, {
      Arn: params.Arn,
      Schema: '{}',
      SourceUrl: 'https://myurl.com',
    });
  });

  const typeInfo = await testee.describeResourceType(typeName);

  expect(typeInfo.Schema).toBe('{}');
  expect(typeInfo.SourceUrl).toBe('https://myurl.com');
});

test('should handle paging correctly', async () => {
  AWSMock.setSDKInstance(AWS);

  const typeName = 'Test::Resource::Type';
  const typeArn = 'arn:aws:cloudformation:eu-central-1::type/resource/Test-Resource-Type';

  AWSMock.mock('CloudFormation', 'listTypes', (params: AWS.CloudFormation.ListTypesInput, cb) => {
    expect(params.Filters!.TypeNamePrefix).toBe(typeName);
    if (!params.NextToken) {
      cb(null, {
        NextToken: 'PagingToken',
      });
    } else if (params.NextToken === 'PagingToken') {
      cb(null, {
        TypeSummaries: [{
          TypeName: typeName,
          TypeArn: typeArn,
        }],
      });
    } else {
      cb(new Error('Invalid paging token'), {});
    }
  });
  AWSMock.mock('CloudFormation', 'describeType', (params: AWS.CloudFormation.DescribeTypeInput, cb) => {
    expect(params.Arn).toBe(typeArn);
    cb(null, {
      Arn: params.Arn,
      Schema: '{}',
      SourceUrl: 'https://myurl.com',
    });
  });

  const typeInfo = await testee.describeResourceType(typeName);

  expect(typeInfo.Schema).toBe('{}');
  expect(typeInfo.SourceUrl).toBe('https://myurl.com');
});

test('should fail on multiple type candidates', async () => {
  AWSMock.setSDKInstance(AWS);

  const typeName = 'Test::Resource::Type';

  AWSMock.mock('CloudFormation', 'listTypes', (params: AWS.CloudFormation.ListTypesInput, cb) => {
    expect(params.Filters!.TypeNamePrefix).toBe(typeName);
    cb(null, {
      TypeSummaries: [{
        TypeName: typeName,
        TypeArn: 'arn:aws:cloudformation:eu-central-1::type/resource/Test-Resource-Type',
      }, {
        TypeName: typeName + '::Sub',
        TypeArn: 'arn:aws:cloudformation:eu-central-1::type/resource/Test-Resource-Type_sub',
      }],
    });
  });
  AWSMock.mock('CloudFormation', 'describeType', (_, cb) => {
    cb(new Error('Should never be called'), {});
  });

  await expect(testee.describeResourceType(typeName)).rejects.toThrow(/unique CloudFormation Type/);
});

test('should fail on missing schema', async () => {
  AWSMock.setSDKInstance(AWS);

  const typeName = 'Test::Resource::Type';
  const typeArn = 'arn:aws:cloudformation:eu-central-1::type/resource/Test-Resource-Type';

  AWSMock.mock('CloudFormation', 'listTypes', (params: AWS.CloudFormation.ListTypesInput, cb) => {
    expect(params.Filters!.TypeNamePrefix).toBe(typeName);
    cb(null, {
      TypeSummaries: [{
        TypeName: typeName,
        TypeArn: typeArn,
      }],
    });
  });
  AWSMock.mock('CloudFormation', 'describeType', (params: AWS.CloudFormation.DescribeTypeInput, cb) => {
    expect(params.Arn).toBe(typeArn);
    cb(null, {
      Arn: params.Arn,
      SourceUrl: 'https://myurl.com',
    });
  });

  await expect(testee.describeResourceType(typeName)).rejects.toThrow(/does not contain schema/);
});

afterEach(() => {
  AWSMock.restore();
});