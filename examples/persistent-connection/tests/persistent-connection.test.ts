import { Socket } from 'net';
import { clients, gatewayApp } from '../src/gateway';
import { inventoryServer } from '../src/services/inventory/server';
import { productsServer } from '../src/services/products/server';

describe('Persistent connection', () => {
  const connectionSet = new Set<Socket>();
  beforeAll(async () => {
    productsServer.on('connection', connection => {
      // Gateway should only open 1 connection to each service
      expect(connectionSet.size).toBeLessThanOrEqual(2);
      connectionSet.add(connection);
    });
    inventoryServer.on('connection', connection => {
      // Gateway should only open 1 connection to each service
      expect(connectionSet.size).toBeLessThanOrEqual(2);
      connectionSet.add(connection);
    });
    await new Promise<void>(resolve => productsServer.listen(4001, resolve));
    await new Promise<void>(resolve => inventoryServer.listen(4002, resolve));
  });
  afterAll(async () => {
    connectionSet.forEach(connection => connection.destroy());
    clients.forEach(client => client.dispose());
    await new Promise(resolve => productsServer.close(resolve));
    await new Promise(resolve => inventoryServer.close(resolve));
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
            product1: product(id: "1") {
              id
              name
              stock
            }
            product2: product(id: "2") {
              id
              name
              stock
            }
          }
        `,
      }),
    });
    const result = await response.json();
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "product1": {
            "id": "1",
            "name": "Product 1",
            "stock": 100,
          },
          "product2": {
            "id": "2",
            "name": "Product 2",
            "stock": 200,
          },
        },
      }
    `);
  });
});
