import { gatewayApp } from '../src/gateway';

describe('Type merging with multiple keys', () => {
  it('should work', async () => {
    const response = await gatewayApp.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            # catalog service
            productsByUpc(upcs: ["1"]) {
              upc
              name
              retailPrice
              reviews {
                id
                body
              }
            }

            # vendors service
            productsByKey(keys: [{ upc: "1" }, { id: "101" }]) {
              id
              upc
              name
              retailPrice
              reviews {
                id
                body
              }
            }

            # reviews service
            productsById(ids: ["101"]) {
              id
              name
              retailPrice
              reviews {
                id
                body
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
          "productsById": [
            {
              "id": "101",
              "name": "Table",
              "retailPrice": 879,
              "reviews": [
                {
                  "body": "Love it!",
                  "id": "1",
                },
                {
                  "body": "Prefer something else.",
                  "id": "4",
                },
              ],
            },
          ],
          "productsByKey": [
            {
              "id": "101",
              "name": "Table",
              "retailPrice": 879,
              "reviews": [
                {
                  "body": "Love it!",
                  "id": "1",
                },
                {
                  "body": "Prefer something else.",
                  "id": "4",
                },
              ],
              "upc": "1",
            },
            {
              "id": "101",
              "name": "Table",
              "retailPrice": 879,
              "reviews": [
                {
                  "body": "Love it!",
                  "id": "1",
                },
                {
                  "body": "Prefer something else.",
                  "id": "4",
                },
              ],
              "upc": "1",
            },
          ],
          "productsByUpc": [
            {
              "name": "Table",
              "retailPrice": 879,
              "reviews": [
                {
                  "body": "Love it!",
                  "id": "1",
                },
                {
                  "body": "Prefer something else.",
                  "id": "4",
                },
              ],
              "upc": "1",
            },
          ],
        },
      }
    `);
  });
});
