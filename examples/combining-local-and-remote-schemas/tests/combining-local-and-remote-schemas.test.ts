import { createYoga } from 'graphql-yoga';
import { createServer, Server } from 'http';
import { gatewayApp } from '../src/gateway';
import { schema as productsSchema } from '../src/services/products/schema';
import { schema as storefrontsSchema } from '../src/services/storefronts/schema';

describe('Combining local and remote schemas', () => {
  let productsServer: Server;
  let storefrontsServer: Server;
  beforeAll(async () => {
    const productsApp = createYoga({
      schema: productsSchema,
    });
    productsServer = createServer(productsApp);
    const productsPort = 4001;

    const storefrontsApp = createYoga({
      schema: storefrontsSchema,
    });
    storefrontsServer = createServer(storefrontsApp);
    const storefrontsPort = 4002;

    await Promise.all([
      new Promise<void>(resolve => productsServer.listen(productsPort, resolve)),
      new Promise<void>(resolve => storefrontsServer.listen(storefrontsPort, resolve)),
    ]);
  });
  afterAll(async () => {
    await Promise.all([
      new Promise<any>(resolve => productsServer.close(resolve)),
      new Promise<any>(resolve => storefrontsServer.close(resolve)),
    ]);
  });
  it('should return the correct data', async () => {
    const response = await gatewayApp.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            product(upc: "1") {
              upc
              name
            }
            rainforestProduct(upc: "2") {
              upc
              name
            }
            storefront(id: "2") {
              id
              name
            }
            errorCodes
            heartbeat
          }
        `,
      }),
    });

    const result = await response.json();
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "errorCodes": [
            "NOT_FOUND",
            "GRAPHQL_PARSE_FAILED",
            "GRAPHQL_VALIDATION_FAILED",
          ],
          "heartbeat": "OK",
          "product": {
            "name": "Cookbook",
            "upc": "1",
          },
          "rainforestProduct": {
            "name": "Toothbrush",
            "upc": "2",
          },
          "storefront": {
            "id": "2",
            "name": "eShoppe",
          },
        },
      }
    `);
  });
  it('should handle errors correctly', async () => {
    const response = await gatewayApp.fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            product(upc: "99") {
              upc
              name
            }
          }
        `,
      }),
    });
    const result = await response.json();

    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "product": null,
        },
        "errors": [
          {
            "extensions": {
              "code": "NOT_FOUND",
            },
            "message": "Record not found",
            "path": [
              "product",
            ],
          },
        ],
      }
    `);
  });
});
