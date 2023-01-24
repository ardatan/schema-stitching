import { gatewayApp } from '../src/gateway';
import { productsServer } from '../src/services/products/server';
import { reviewsServer } from '../src/services/reviews/server';
import { usersServer } from '../src/services/users/server';

describe('Federation services', () => {
  beforeAll(async () => {
    await Promise.all([
      new Promise<void>(resolve => productsServer.listen(4001, resolve)),
      new Promise<void>(resolve => reviewsServer.listen(4002, resolve)),
      new Promise<void>(resolve => usersServer.listen(4003, resolve)),
    ]);
  });
  afterAll(async () => {
    await Promise.all([
      new Promise(resolve => productsServer.close(resolve)),
      new Promise(resolve => reviewsServer.close(resolve)),
      new Promise(resolve => usersServer.close(resolve)),
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
            user(id: "1") {
              username
              recentPurchases {
                upc
                name
              }
              reviews {
                body
                author {
                  id
                  username
                }
                product {
                  upc
                  name
                  acceptsNewReviews
                }
              }
            }
          }
        `,
      }),
    });
    const result = await response.json();
    expect(result).toMatchSnapshot('users');
  });
});
