import { gatewapApp } from '../src';

describe('Custom merge resolvers', () => {
  it('should work', async () => {
    const response = await gatewapApp.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            productsInfo(whereIn: ["1", "X", "2", "3"]) {
              id
              title
              totalInventory
              price
            }
          }
        `,
      }),
    });
    const result = await response.json();
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "productsInfo": [
            {
              "id": "1",
              "price": 14,
              "title": "Wallet",
              "totalInventory": 1,
            },
            {
              "id": "2",
              "price": null,
              "title": "Watch",
              "totalInventory": null,
            },
            {
              "id": "3",
              "price": 22,
              "title": "Hat",
              "totalInventory": 5,
            },
          ],
        },
      }
    `);
  });
});
