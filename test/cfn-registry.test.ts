import * as testee from '../src/cfn-registry';

test('should return schema of single registry type', async () => {
  const typeName = 'Test::Resource::Type';
  const typeArn = 'arn:aws:cloudformation:eu-central-1::type/resource/Test-Resource-Type';

  const client: testee.ICloudFormationClient = {
    listTypes: jest.fn().mockImplementation(async params => {
      expect(params.Filters!.TypeNamePrefix).toBe(typeName);
      return {
        TypeSummaries: [{
          TypeName: typeName,
          TypeArn: typeArn,
        }],
      };
    }),
    describeType: jest.fn().mockImplementation(async params => {
      expect(params.Arn).toBe(typeArn);
      return {
        Arn: params.Arn,
        TypeName: typeName,
        Schema: '{}',
        SourceUrl: 'https://myurl.com',
      };
    }),
  };

  const typeInfo = await testee.describeResourceType(typeName, { client });

  expect(typeInfo.Schema).toBe('{}');
  expect(typeInfo.SourceUrl).toBe('https://myurl.com');
});

test('should handle paging correctly', async () => {
  const typeName = 'Test::Resource::Type';
  const typeArn = 'arn:aws:cloudformation:eu-central-1::type/resource/Test-Resource-Type';

  const client: testee.ICloudFormationClient = {
    listTypes: jest.fn().mockImplementation(async params => {
      expect(params.Filters!.TypeNamePrefix).toBe(typeName);
      expect(params.Type).toBe('RESOURCE');
      if (!params.NextToken) {
        return {
          NextToken: 'PagingToken',
        };
      } else if (params.NextToken === 'PagingToken') {
        return {
          TypeSummaries: [{
            TypeName: typeName,
            TypeArn: typeArn,
          }],
        };
      } else {
        throw new Error('Invalid paging token');
      }
    }),
    describeType: jest.fn().mockImplementation(async params => {
      expect(params.Arn).toBe(typeArn);
      return {
        Arn: params.Arn,
        TypeName: typeName,
        Schema: '{}',
        SourceUrl: 'https://myurl.com',
      };
    }),
  };

  const typeInfo = await testee.describeResourceType(typeName, { client });

  expect(typeInfo.Schema).toBe('{}');
  expect(typeInfo.SourceUrl).toBe('https://myurl.com');
});

test('should use ARN on missing source url', async () => {
  const typeName = 'Test::Resource::Type';
  const typeArn = 'arn:aws:cloudformation:eu-central-1::type/resource/Test-Resource-Type';

  const client: testee.ICloudFormationClient = {
    listTypes: jest.fn().mockImplementation(async params => {
      expect(params.Filters!.TypeNamePrefix).toBe(typeName);
      return {
        TypeSummaries: [{
          TypeName: typeName,
          TypeArn: typeArn,
        }],
      };
    }),
    describeType: jest.fn().mockImplementation(async params => {
      expect(params.Arn).toBe(typeArn);
      return {
        Arn: params.Arn,
        TypeName: typeName,
        Schema: '{}',
      };
    }),
  };

  const typeInfo = await testee.describeResourceType(typeName, { client });

  expect(typeInfo.Schema).toBe('{}');
  expect(typeInfo.SourceUrl).toBe(typeArn);
});

test('should handle MODULES correctly', async () => {
  const typeName = 'Test::Resource::Type::MODULE';
  const typeArn = 'arn:aws:cloudformation:eu-central-1::type/module/uuid/Test-Resource-Type-MODULE';

  const client: testee.ICloudFormationClient = {
    listTypes: jest.fn().mockImplementation(async params => {
      expect(params.Filters!.TypeNamePrefix).toBe(typeName);
      expect(params.Type).toBe('MODULE');
      return {
        TypeSummaries: [{
          TypeName: typeName,
          TypeArn: typeArn,
        }],
      };
    }),
    describeType: jest.fn().mockImplementation(async params => {
      expect(params.Arn).toBe(typeArn);
      return {
        Arn: params.Arn,
        TypeName: typeName,
        Schema: '{}',
      };
    }),
  };

  const typeInfo = await testee.describeResourceType(typeName, { client });

  expect(typeInfo.Schema).toBe('{}');
  expect(typeInfo.SourceUrl).toBe(typeArn);
});

test('should fail on multiple type candidates', async () => {
  const typeName = 'Test::Resource::Type';

  const client: testee.ICloudFormationClient = {
    listTypes: jest.fn().mockImplementation(async params => {
      expect(params.Filters!.TypeNamePrefix).toBe(typeName);
      return {
        TypeSummaries: [{
          TypeName: typeName,
          TypeArn: 'arn:aws:cloudformation:eu-central-1::type/resource/Test-Resource-Type',
        }, {
          TypeName: typeName + '::Sub',
          TypeArn: 'arn:aws:cloudformation:eu-central-1::type/resource/Test-Resource-Type_sub',
        }],
      };
    }),
    describeType: jest.fn().mockImplementation(async () => {
      throw new Error('Should never be called');
    }),
  };

  await expect(testee.describeResourceType(typeName, { client })).rejects.toThrow(/unique CloudFormation Type/);
});

test('should fail on missing schema', async () => {

  const typeName = 'Test::Resource::Type';
  const typeArn = 'arn:aws:cloudformation:eu-central-1::type/resource/Test-Resource-Type';

  const client: testee.ICloudFormationClient = {
    listTypes: jest.fn().mockImplementation(async params => {
      expect(params.Filters!.TypeNamePrefix).toBe(typeName);
      return {
        TypeSummaries: [{
          TypeName: typeName,
          TypeArn: typeArn,
        }],
      };
    }),
    describeType: jest.fn().mockImplementation(async params => {
      expect(params.Arn).toBe(typeArn);
      return {
        Arn: params.Arn,
        TypeName: typeName,
        SourceUrl: 'https://myurl.com',
      };
    }),
  };

  await expect(testee.describeResourceType(typeName, { client })).rejects.toThrow(/does not contain schema/);
});

test('should handle lookup by ARN correctly', async () => {
  const typeName = 'Test::Resource::Type';
  const typeArn = 'arn:aws:cloudformation:eu-central-1::type/resource/Test-Resource-Type';

  const client: testee.ICloudFormationClient = {
    listTypes: jest.fn().mockImplementation(async () => {
      throw new Error('Should never be called');
    }),
    describeType: jest.fn().mockImplementation(async params => {
      expect(params.Arn).toBe(typeArn);
      return {
        Arn: params.Arn,
        TypeName: typeName,
        Schema: '{}',
        SourceUrl: 'https://myurl.com',
      };
    }),
  };

  const typeInfo = await testee.describeResourceType(typeArn, { client });
  expect(typeInfo.Schema).toBe('{}');
  expect(typeInfo.TypeName).toBe(typeName);
  expect(typeInfo.SourceUrl).toBe('https://myurl.com');
});

test('should look up private types if "private" is set to "true"', async () => {
  const typeName = 'Test::Resource::Type::MODULE';
  const typeArn = 'arn:aws:cloudformation:eu-central-1::type/module/uuid/Test-Resource-Type-MODULE';

  const client: testee.ICloudFormationClient = {
    listTypes: jest.fn().mockImplementation(async params => {
      expect(params.Visibility).toBe('PRIVATE');
      return {
        TypeSummaries: [{
          TypeName: typeName,
          TypeArn: typeArn,
        }],
      };
    }),
    describeType: jest.fn().mockImplementation(async params => {
      expect(params.Arn).toBe(typeArn);
      return {
        Arn: params.Arn,
        TypeName: typeName,
        Schema: '{}',
      };
    }),
  };

  const typeInfo = await testee.describeResourceType(typeName, { private: true, client });

  expect(typeInfo.Schema).toBe('{}');
  expect(typeInfo.SourceUrl).toBe(typeArn);
});

afterEach(() => {
  jest.restoreAllMocks();
});