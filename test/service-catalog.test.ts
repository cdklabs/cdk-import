import * as testee from '../src/service-catalog';

let client: testee.IServiceCatalogClient;

beforeEach(() => {
  client = {
    searchProducts: jest.fn().mockImplementation(async () => {
      throw new Error('Not implemented');
    }),
    listLaunchPaths: jest.fn().mockImplementation(async () => {
      throw new Error('Not implemented');
    }),
    listProvisioningArtifacts: jest.fn().mockImplementation(async () => {
      throw new Error('Not implemented');
    }),
    describeProvisioningParameters: jest.fn().mockImplementation(async () => {
      throw new Error('Not implemented');
    }),
  };
}),

test('search products should fetch query product view summary', async () => {
  const productId = 'prod-abc123';

  client.searchProducts = jest.fn().mockImplementation( () => {
    return {
      ProductViewSummaries: [{
        ProductId: productId,
      }],
    };
  });

  const availableProducts = await testee.fetchAvailableProducts({ client: client, productId: productId });
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

  const availableProducts = await testee.fetchAvailableProducts( { client: client });
  expect(availableProducts[0].ProductId).toBe(productId1);
  expect(availableProducts[1].ProductId).toBe(productId2);
  expect(availableProducts.length).toBe(2);
});

test('list provisioning artifacts return list of provisioning artifact details', async () => {
  const productId = 'prod-abc123';
  const paId ='pa-abc123';

  client.listProvisioningArtifacts = jest.fn().mockImplementation(async params => {
    expect(params.ProductId).toBe(productId);
    return {
      ProvisioningArtifactDetails: [
        {
          Id: paId,
          Name: 'v1.0',
          Description: 'description',
        },
      ],
    };
  });

  const provisioningArtifacts = await testee.listProvisioningArtifacts(productId, { client });
  expect(provisioningArtifacts[0].Id).toBe(paId);
  expect(provisioningArtifacts.length).toBe(1);
});

test('list provisioning artifacts returns query provisioning artifact detail', async () => {
  const productId = 'prod-abc123';
  const paId ='pa-abc123';
  const queryPaId ='pa-query123';

  client.listProvisioningArtifacts = jest.fn().mockImplementation(async params => {
    expect(params.ProductId).toBe(productId);
    return {
      ProvisioningArtifactDetails: [
        {
          Id: paId,
          Name: 'v1.0',
          Description: 'description1',
        },
        {
          Id: queryPaId,
          Name: 'v2.0',
          Description: 'description2',
        },
      ],
    };
  });

  const provisioningArtifacts = await testee.listProvisioningArtifacts(productId, {
    client: client,
    provisioningArtifactId: queryPaId,
  });
  expect(provisioningArtifacts[0].Id).toBe(queryPaId);
  expect(provisioningArtifacts.length).toBe(1);
});

test('list launch paths should fetch query launch path', async () => {
  const productId = 'prod-abc123';
  const launchPathId = 'lp-abc123';

  client.listLaunchPaths = jest.fn().mockImplementation(async params => {
    expect(params.ProductId).toBe(productId);
    return {
      LaunchPathSummaries: [{
        Id: launchPathId,
      }],
    };
  });

  const launchPaths = await testee.listLaunchPaths(productId, {
    client: client,
    launchPathId: launchPathId,
  });
  expect(launchPaths[0].Id).toBe(launchPathId);
  expect(launchPaths.length).toBe(1);
});

test('list launch paths should handle pagination', async () => {
  const productId = 'prod-abc123';
  const launchPathId1 = 'lp-abc123';
  const launchPathId2 = 'lp-abc456';

  client.listLaunchPaths = jest.fn().mockImplementation(async params => {
    expect(params.ProductId).toBe(productId);
    if (!params.PageToken) {
      return {
        NextPageToken: 'NextPageToken',
        LaunchPathSummaries: [{
          Id: launchPathId1,
        }],
      };
    } else if (params.PageToken === 'NextPageToken') {
      return {
        LaunchPathSummaries: [{
          Id: launchPathId2,
        }],
      };
    } else {
      throw new Error('Invalid pagination token');
    }
  });

  const launchPaths = await testee.listLaunchPaths(productId, { client: client });
  expect(launchPaths[0].Id).toBe(launchPathId1);
  expect(launchPaths[1].Id).toBe(launchPathId2);
  expect(launchPaths.length).toBe(2);
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

  const provisioningParameters = await testee.describeProvisioningParameters(
    productId,
    provisioningArtifactId,
    launchPathId,
    { client: client },
  );

  expect(provisioningParameters.ProvisioningArtifactParameters).toBe(provisioningArtifactParameters);
});

afterEach(() => {
  jest.restoreAllMocks();
});
