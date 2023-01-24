import { gatewayApp } from '../gateway';

describe('Public and private APIs', () => {
  it('public API should not allow to query internal fields', async () => {
    const response = await gatewayApp.fetch('http://localhost/public/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            _sdl
          }
        `,
      }),
    });
    const result = await response.json();
    expect(result).toMatchSnapshot('public-internal');
  });
  it('private API should allow to query internal fields', async () => {
    const response = await gatewayApp.fetch('http://localhost/private/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            _users(ids: ["1"]) {
              __typename
            }
          }
        `,
      }),
    });
    const result = await response.json();
    expect(result).toMatchSnapshot('private-internal');
  });
});
