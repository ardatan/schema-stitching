import { gatewayApp } from '../src/gateway';

describe('Cross-service interfaces', () => {
  it('should work', async () => {
    const response = await gatewayApp.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            storefront(id: "1") {
              id
              name
              productOfferings {
                __typename
                id
                name
                price
                ... on ProductDeal {
                  products {
                    name
                    price
                  }
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
            "id": "1",
            "name": "eShoppe",
            "productOfferings": [
              {
                "__typename": "Product",
                "id": "1",
                "name": "iPhone",
                "price": 699.99,
              },
              {
                "__typename": "ProductDeal",
                "id": "1",
                "name": "iPhone + Survival Guide",
                "price": 679.99,
                "products": [
                  {
                    "name": "iPhone",
                    "price": 699.99,
                  },
                  {
                    "name": "iOS Survival Guide",
                    "price": 24.99,
                  },
                ],
              },
              {
                "__typename": "Product",
                "id": "2",
                "name": "Apple Watch",
                "price": 399.99,
              },
            ],
          },
        },
      }
    `);
  });
});
