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
      TypeName: typeName,
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
    expect(params.Type).toBe('RESOURCE');
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
      TypeName: typeName,
      Schema: '{}',
      SourceUrl: 'https://myurl.com',
    });
  });

  const typeInfo = await testee.describeResourceType(typeName);

  expect(typeInfo.Schema).toBe('{}');
  expect(typeInfo.SourceUrl).toBe('https://myurl.com');
});

test('should use ARN on missing source url', async () => {
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
      TypeName: typeName,
      Schema: '{}',
    });
  });

  const typeInfo = await testee.describeResourceType(typeName);

  expect(typeInfo.Schema).toBe('{}');
  expect(typeInfo.SourceUrl).toBe(typeArn);
});

test('should handle MODULES correctly', async () => {
  AWSMock.setSDKInstance(AWS);

  const typeName = 'Test::Resource::Type::MODULE';
  const typeArn = 'arn:aws:cloudformation:eu-central-1::type/module/uuid/Test-Resource-Type-MODULE';

  AWSMock.mock('CloudFormation', 'listTypes', (params: AWS.CloudFormation.ListTypesInput, cb) => {
    expect(params.Filters!.TypeNamePrefix).toBe(typeName);
    expect(params.Type).toBe('MODULE');
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
      TypeName: typeName,
      Schema: '{}',
    });
  });

  const typeInfo = await testee.describeResourceType(typeName);

  expect(typeInfo.Schema).toBe('{}');
  expect(typeInfo.SourceUrl).toBe(typeArn);
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
      TypeName: typeName,
      SourceUrl: 'https://myurl.com',
    });
  });

  await expect(testee.describeResourceType(typeName)).rejects.toThrow(/does not contain schema/);
});

test('should handle lookup by ARN correctly', async () => {
  AWSMock.setSDKInstance(AWS);

  const typeName = 'Test::Resource::Type';
  const typeArn = 'arn:aws:cloudformation:eu-central-1::type/resource/Test-Resource-Type';

  AWSMock.mock('CloudFormation', 'listTypes', (_params: AWS.CloudFormation.ListTypesInput, cb) => {
    cb(new Error('Should never be called'), {});
  });
  AWSMock.mock('CloudFormation', 'describeType', (params: AWS.CloudFormation.DescribeTypeInput, cb) => {
    expect(params.Arn).toBe(typeArn);
    cb(null, {
      Arn: params.Arn,
      TypeName: typeName,
      Schema: '{}',
      SourceUrl: 'https://myurl.com',
    });
  });

  const typeInfo = await testee.describeResourceType(typeArn);

  expect(typeInfo.Schema).toBe('{}');
  expect(typeInfo.TypeName).toBe(typeName);
  expect(typeInfo.SourceUrl).toBe('https://myurl.com');
});

test('should look up private typrs if "private" is set to "true"', async () => {
  AWSMock.setSDKInstance(AWS);

  const typeName = 'Test::Resource::Type::MODULE';
  const typeArn = 'arn:aws:cloudformation:eu-central-1::type/module/uuid/Test-Resource-Type-MODULE';

  AWSMock.mock('CloudFormation', 'listTypes', (params: AWS.CloudFormation.ListTypesInput, cb) => {
    expect(params.Visibility).toBe('PRIVATE');
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
      TypeName: typeName,
      Schema: '{}',
    });
  });

  const typeInfo = await testee.describeResourceType(typeName, undefined, { private: true });

  expect(typeInfo.Schema).toBe('{}');
  expect(typeInfo.SourceUrl).toBe(typeArn);
});

afterEach(() => {
  AWSMock.restore();
});