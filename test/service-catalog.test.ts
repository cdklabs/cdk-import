import * as testee from '../src/service-catalog';

let client: testee.IServiceCatalogClient;

beforeEach(() => {
  client = {
    searchProducts: jest.fn().mockImplementation(async () => {
      throw new Error('Not implemented');
    }),
    describeProduct: jest.fn().mockImplementation(async () => {
      throw new Error('Not implemented');
    }),
    describeProvisioningParameters: jest.fn().mockImplementation(async () => {
      throw new Error('Not implemented');
    }),
  };
}),

test('search products should fetch product view summaries', async () => {
  const productId = 'prod-abc123';

  client.searchProducts = jest.fn().mockImplementation( () => {
    return {
      ProductViewSummaries: [{
        ProductId: productId,
      }],
    };
  });

  const availableProducts = await testee.fetchAvailableProducts(client);
  expect(availableProducts[0].ProductId).toBe(productId);
  expect(availableProducts.length).toBe(1);
});

test('search products should handle pagination', async () => {
  const productId1 = 'prod-abc123';
  const productId2 = 'prod-abc456';

  client.searchProducts = jest.fn().mockImplementation( async params => {
    if (!params.PageToken) {
      return {
        NextPageToken: 'NextPageToken',
        ProductViewSummaries: [{
          ProductId: productId1,
        }],
      };
    } else if (params.PageToken === 'NextPageToken') {
      return {
        ProductViewSummaries: [{
          ProductId: productId2,
        }],
      };
    } else {
      throw new Error('Invalid pagination token');
    }
  });

  const availableProducts = await testee.fetchAvailableProducts(client);
  expect(availableProducts[0].ProductId).toBe(productId1);
  expect(availableProducts[1].ProductId).toBe(productId2);
  expect(availableProducts.length).toBe(2);
});

test('describe product aggregate should create product data aggregate ', async () => {
  const productId = 'prod-abc123';
  const launchPathId = 'lp-abc123';
  const provisioningArtifactId = 'pa-abc123';
  const provisioningArtifactParameters = [
    {
      ParameterKey: 'Key',
      ParameterType: 'String',
      Description: 'Parameter Description',
    },
  ];

  client.describeProduct = jest.fn().mockImplementation( async params => {
    expect(params.Id).toBe(productId);
    return {
      ProductViewSummary: {
        ProductId: productId,
      },
      ProvisioningArtifacts: [{
        Id: provisioningArtifactId,
        Name: 'v1.0',
        Description: 'description',
      }],
      LaunchPaths: [{
        Id: launchPathId,
      }],
    };
  });

  client.describeProvisioningParameters = jest.fn().mockImplementation( () => {
    return {
      ProvisioningArtifactParameters: provisioningArtifactParameters,
    };
  });

  const describedProduct = await testee.describeProductAggregate( {
    productId: productId,
    launchPathId: launchPathId,
    provisioningArtifactId: provisioningArtifactId,
    client: client,
  });

  expect(describedProduct.product.ProductId).toBe(productId);
});

test('should describe provisioning parameters', async () => {
  const productId = 'prod-abc123';
  const launchPathId = 'lp-abc123';
  const provisioningArtifactId = 'pa-abc123';
  const provisioningArtifactParameters = [
    {
      ParameterKey: 'Key',
      ParameterType: 'String',
      Description: 'Parameter Description',
    },
  ];

  client.describeProvisioningParameters = jest.fn().mockImplementation( () => {
    return {
      ProvisioningArtifactParameters: provisioningArtifactParameters,
    };
  });

  const provisioningParameters = await testee.describeProvisioningParameters( {
    productId: productId,
    provisioningArtifactId: provisioningArtifactId,
    launchPathId: launchPathId,
    client: client,
  });

  expect(provisioningParameters.ProvisioningArtifactParameters).toBe(provisioningArtifactParameters);
});

test('describe product aggregate handle default artifact paths', async () => {
  const productId = 'prod-abc123';
  const provisioningArtifactId = 'pa-abc123';

  client.describeProduct = jest.fn().mockImplementation( async params => {
    expect(params.Id).toBe(productId);
    return {
      ProductViewSummary: {
        ProductId: productId,
      },
      ProvisioningArtifacts: [
        {
          Id: 'pa-abc456',
          Name: 'v2.0',
          Description: 'description',
        },
        {
          Id: provisioningArtifactId,
          Name: 'v1.0',
          Description: 'description',
          Guidance: 'DEFAULT',
        },
      ],
      LaunchPaths: [{
        Id: 'lp-abc123',
      }],
    };
  });
  client.describeProvisioningParameters = jest.fn().mockImplementation( () => {
    return {
      ProvisioningArtifactParameters: [],
    };
  });

  const describedProduct = await testee.describeProductAggregate( {
    productId: productId,
    client: client,
  });

  expect(describedProduct.product.ProductId).toBe(productId);
  expect(describedProduct.provisioningArtifact.Id).toBe(provisioningArtifactId);
});

test('describe product aggregate handle most recently created artifact paths', async () => {
  const productId = 'prod-abc123';
  const provisioningArtifactId = 'pa-abc123';

  client.describeProduct = jest.fn().mockImplementation( async params => {
    expect(params.Id).toBe(productId);
    return {
      ProductViewSummary: {
        ProductId: productId,
      },
      ProvisioningArtifacts: [
        {
          Id: 'pa-abc456',
          Name: 'v2.0',
          Description: 'description',
          CreatedTime: '2022-02-15T16:56:31-05:00',
        },
        {
          Id: provisioningArtifactId,
          Name: 'v1.0',
          Description: 'description',
          CreatedTime: '2022-02-16T16:56:31-05:00',
        },
      ],
      LaunchPaths: [{
        Id: 'lp-abc123',
      }],
    };
  });
  client.describeProvisioningParameters = jest.fn().mockImplementation( () => {
    return {
      ProvisioningArtifactParameters: [],
    };
  });

  const describedProduct = await testee.describeProductAggregate( {
    productId: productId,
    client: client,
  });

  expect(describedProduct.product.ProductId).toBe(productId);
  expect(describedProduct.provisioningArtifact.Id).toBe(provisioningArtifactId);
});

test('describe product aggregate should resolve launch path', async () => {
  const productId = 'prod-abc123';
  const provisioningArtifactId = 'pa-abc123';
  const launchPathId = 'lp-abc123';

  client.describeProduct = jest.fn().mockImplementation( async params => {
    expect(params.Id).toBe(productId);
    return {
      ProductViewSummary: {
        ProductId: productId,
      },
      ProvisioningArtifacts: [
        {
          Id: 'pa-abc456',
          Name: 'v2.0',
          Description: 'description',
        },
        {
          Id: provisioningArtifactId,
          Name: 'v1.0',
          Description: 'description',
          Guidance: 'DEFAULT',
        },
      ],
      LaunchPaths: [{
        Id: launchPathId,
      }],
    };
  });
  client.describeProvisioningParameters = jest.fn().mockImplementation( () => {
    return {
      ProvisioningArtifactParameters: [],
    };
  });

  const describedProduct = await testee.describeProductAggregate( {
    productId: productId,
    client: client,
  });

  expect(describedProduct.product.ProductId).toBe(productId);
  expect(describedProduct.provisioningArtifact.Id).toBe(provisioningArtifactId);
  expect(describedProduct.launchPath.Id).toBe(launchPathId);
});

test('should fail to resolvable multiple launch paths ', async () => {
  const productId = 'prod-abc123';

  client.describeProduct = jest.fn().mockImplementation( async params => {
    expect(params.Id).toBe(productId);
    return {
      ProductViewSummary: {
        ProductId: productId,
      },
      ProvisioningArtifacts: [
        {
          Id: 'pa-abc123',
          Name: 'v1.0',
          Description: 'description',
        },
      ],
      LaunchPaths: [{
        Id: 'lp-abc123',
      },
      {
        Id: 'lp-abc456',
      }],
    };
  });

  await expect(testee.describeProductAggregate( {
    productId: productId,
    client: client,
  })).rejects.toThrow(/Unable to resolve between multiple launch paths./);
});

afterEach(() => {
  jest.restoreAllMocks();
});
