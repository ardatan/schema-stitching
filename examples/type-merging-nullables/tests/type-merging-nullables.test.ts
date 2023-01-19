import { gatewayApp } from '../src/gateway';

describe('Nullable merges', () => {
  it('should give the correct result', async () => {
    const response = await gatewayApp.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            users(ids: [2]) {
              username
              reviews {
                body
              }
            }
            products(upcs: [2]) {
              name
              reviews {
                body
              }
            }
          }
        `,
      }),
    });
    const result = await response.json();
    expect(result).toMatchObject({
      data: {
        users: [
          {
            username: 'bigvader23',
            reviews: [],
          },
        ],
        products: [
          {
            name: 'Toothbrush',
            reviews: null,
          },
        ],
      },
    });
  });
  it('should give null user result', async () => {
    const response = await gatewayApp.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            _users(ids: ["DOES_NOT_EXIST"]) {
              id
              reviews {
                body
              }
            }
          }
        `,
      }),
    });
    const result = await response.json();
    expect(result).toMatchObject({
      data: {
        _users: [{ id: 'DOES_NOT_EXIST', reviews: [] }],
      },
    });
  });
  it('should give null product result', async () => {
    const response = await gatewayApp.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            _products(upcs: ["DOES_NOT_EXIST"]) {
              upc
              reviews {
                body
              }
            }
          }
        `,
      }),
    });
    const result = await response.json();
    expect(result).toMatchObject({
      data: {
        _products: [null],
      },
    });
  });
});
