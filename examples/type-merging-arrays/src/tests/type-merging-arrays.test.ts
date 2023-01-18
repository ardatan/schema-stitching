import { gatewayApp } from '../gateway';
import { manufacturerServer } from '../services/manufacturers/server';
import { productsServer } from '../services/products/server';
import { storefrontsServer } from '../services/storefronts/server';

describe('Array-batched type merging', () => {
  beforeAll(async () => {
    await Promise.all([
      new Promise<void>(resolve => manufacturerServer.listen(4001, resolve)),
      new Promise<void>(resolve => productsServer.listen(4002, resolve)),
      new Promise<void>(resolve => storefrontsServer.listen(4003, resolve)),
    ]);
  });
  afterAll(async () => {
    await Promise.all([
      new Promise(resolve => manufacturerServer.close(resolve)),
      new Promise(resolve => productsServer.close(resolve)),
      new Promise(resolve => storefrontsServer.close(resolve)),
    ]);
  });
  it('should give correct results', async () => {
    const response = await gatewayApp.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            storefront(id: "2") {
              id
              name
              products {
                upc
                name
                manufacturer {
                  products {
                    upc
                    name
                  }
                  name
                }
              }
            }
          }
        `,
      }),
    });
    const result = await response.json();
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "storefront": {
            "id": "2",
            "name": "BestBooks Online",
            "products": [
              {
                "manufacturer": {
                  "name": "Macmillan",
                  "products": [
                    {
                      "name": "Apple Watch",
                      "upc": "2",
                    },
                    {
                      "name": "Super Baking Cookbook",
                      "upc": "3",
                    },
                    {
                      "name": "Best Selling Novel",
                      "upc": "4",
                    },
                  ],
                },
                "name": "Super Baking Cookbook",
                "upc": "3",
              },
              {
                "manufacturer": {
                  "name": "Macmillan",
                  "products": [
                    {
                      "name": "Apple Watch",
                      "upc": "2",
                    },
                    {
                      "name": "Super Baking Cookbook",
                      "upc": "3",
                    },
                    {
                      "name": "Best Selling Novel",
                      "upc": "4",
                    },
                  ],
                },
                "name": "Best Selling Novel",
                "upc": "4",
              },
              {
                "manufacturer": {
                  "name": "Apple",
                  "products": [
                    {
                      "name": "iPhone",
                      "upc": "1",
                    },
                    {
                      "name": "iOS Survival Guide",
                      "upc": "5",
                    },
                  ],
                },
                "name": "iOS Survival Guide",
                "upc": "5",
              },
            ],
          },
        },
      }
    `);
  });
  it('should handle errors correctly', async () => {
    const response = await gatewayApp.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            products(upcs: ["6"]) {
              upc
              name
              manufacturer {
                name
              }
            }
          }
        `,
      }),
    });
    const result = await response.json();
    expect(result).toMatchObject({
      errors: [
        {
          message: 'Record not found',
          path: ['products', 0, 'manufacturer', 'name'],
          extensions: {
            code: 'NOT_FOUND',
          },
        },
      ],
      data: {
        products: [
          {
            upc: '6',
            name: 'Baseball Glove',
            manufacturer: null,
          },
        ],
      },
    });
  });
});
