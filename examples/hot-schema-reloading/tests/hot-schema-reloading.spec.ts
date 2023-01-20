import { createSchema, createYoga } from 'graphql-yoga';
import { createServer } from 'http';
import { startServer, stopServer } from '../src/gateway';
import { inventoryServer } from '../src/services/inventory/server';
import { productsServer } from '../src/services/products/server';

describe('Hot schema reloading', () => {
  let cnt = 0;
  const fooServer = createServer(
    createYoga({
      schema: () => {
        const typeDefs = /* GraphQL */ `
                    type Query {
                        """
                        Count: ${cnt++}
                        """
                        foo: String!
                        _sdl: String!
                    }
                `;
        return createSchema<any>({
          typeDefs,
          resolvers: {
            Query: {
              foo: () => 'bar',
              _sdl: () => typeDefs,
            },
          },
        });
      },
    })
  );
  beforeEach(async () => {
    await Promise.all([
      startServer(),
      new Promise<void>(resolve => productsServer.listen(4001, resolve)),
      new Promise<void>(resolve => inventoryServer.listen(4002, resolve)),
      new Promise<void>(resolve => fooServer.listen(4003, resolve)),
    ]);
  });
  afterEach(async () => {
    cnt = 0;
    await Promise.all([
      stopServer(),
      new Promise(resolve => productsServer.close(resolve)),
      new Promise(resolve => inventoryServer.close(resolve)),
      new Promise(resolve => fooServer.close(resolve)),
    ]);
  });
  async function fetchEndpoints() {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            endpoints {
              url
              sdl
            }
          }
        `,
      }),
    });
    const result = await response.json();
    return result;
  }
  it('should add/remove endpoints correctly', async () => {
    const removeResponse = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          mutation {
            removeEndpoint(url: "http://localhost:4002/graphql") {
              success
            }
          }
        `,
      }),
    });
    const removeResult = await removeResponse.json();
    expect(removeResult).toMatchSnapshot('removeResult');
    const removedEndpointsResult = await fetchEndpoints();
    expect(removedEndpointsResult).toMatchSnapshot('removedEndpointsResult');
    const addResponse = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          mutation {
            addEndpoint(url: "http://localhost:4002/graphql") {
              success
              endpoint {
                url
                sdl
              }
            }
          }
        `,
      }),
    });
    const addResult = await addResponse.json();
    expect(addResult).toMatchSnapshot('addResult');
    const addedEndpointsResult = await fetchEndpoints();
    expect(addedEndpointsResult).toMatchSnapshot('addedEndpointsResult');
  });
  it('should reload schemas correctly', async () => {
    const addResponse = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          mutation {
            addEndpoint(url: "http://localhost:4003/graphql") {
              success
              endpoint {
                url
                sdl
              }
            }
          }
        `,
      }),
    });
    const addResult = await addResponse.json();
    expect(addResult).toMatchSnapshot('addResult');
    const reloadEndpointsResponse = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          mutation {
            reloadAllEndpoints {
              success
            }
          }
        `,
      }),
    });
    const reloadEndpointsResult = await reloadEndpointsResponse.json();
    expect(reloadEndpointsResult).toMatchSnapshot('reloadEndpointsResult');
    const endpointsResult = await fetchEndpoints();
    expect(endpointsResult).toMatchSnapshot('endpointsResult');
  });
});
