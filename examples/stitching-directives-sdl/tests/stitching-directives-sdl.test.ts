import { gatewayApp } from '../src/gateway';
import { accountsServer } from '../src/services/accounts/server';
import { inventoryServer } from '../src/services/inventory/server';
import { productsServer } from '../src/services/products/server';
import { reviewsServer } from '../src/services/reviews/server';

describe('Stitching directives SDL', () => {
  beforeAll(async () => {
    await Promise.all([
      new Promise<void>(resolve => accountsServer.listen(4001, resolve)),
      new Promise<void>(resolve => inventoryServer.listen(4002, resolve)),
      new Promise<void>(resolve => productsServer.listen(4003, resolve)),
      new Promise<void>(resolve => reviewsServer.listen(4004, resolve)),
    ]);
  });
  afterAll(async () => {
    await Promise.all([
      new Promise(resolve => accountsServer.close(resolve)),
      new Promise(resolve => inventoryServer.close(resolve)),
      new Promise(resolve => productsServer.close(resolve)),
      new Promise(resolve => reviewsServer.close(resolve)),
    ]);
  });
  it('should work', async () => {
    const response = await gatewayApp.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            products(upcs: [1, 2]) {
              name
              price
              weight
              inStock
              shippingEstimate
              reviews {
                id
                body
                author {
                  name
                  username
                  totalReviews
                }
                product {
                  name
                  price
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
          "products": [
            {
              "inStock": true,
              "name": "Table",
              "price": 899,
              "reviews": [
                {
                  "author": {
                    "name": "Ada Lovelace",
                    "totalReviews": 2,
                    "username": "@ada",
                  },
                  "body": "Love it!",
                  "id": "1",
                  "product": {
                    "name": "Table",
                    "price": 899,
                  },
                },
                {
                  "author": {
                    "name": "Alan Turing",
                    "totalReviews": 2,
                    "username": "@complete",
                  },
                  "body": "Prefer something else.",
                  "id": "4",
                  "product": {
                    "name": "Table",
                    "price": 899,
                  },
                },
              ],
              "shippingEstimate": 50,
              "weight": 100,
            },
            {
              "inStock": false,
              "name": "Couch",
              "price": 1299,
              "reviews": [
                {
                  "author": {
                    "name": "Ada Lovelace",
                    "totalReviews": 2,
                    "username": "@ada",
                  },
                  "body": "Too expensive.",
                  "id": "2",
                  "product": {
                    "name": "Couch",
                    "price": 1299,
                  },
                },
              ],
              "shippingEstimate": 0,
              "weight": 1000,
            },
          ],
        },
      }
    `);
  });
});
