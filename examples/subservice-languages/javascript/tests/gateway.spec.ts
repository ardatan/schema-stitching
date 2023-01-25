import { gatewayApp } from '../gateway';
import { accountsServer } from '../services/accounts/server';
import { inventoryServer } from '../services/inventory/server';
import { productsServer } from '../services/products/server';
import { reviewsServer } from '../services/reviews/server';

describe('JavaScript Code-First Schemas', () => {
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
    expect(result).toMatchSnapshot('test-query');
  });
});
