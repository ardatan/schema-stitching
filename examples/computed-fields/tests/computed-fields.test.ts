import { gatewayApp } from '../src/gateway';

describe('Computed fields', () => {
  it('should work', async () => {
    const response = await gatewayApp.fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: /* GraphQL */ `
          query {
            products(upcs: [1, 2, 3, 4]) {
              name
              price
              category {
                name
              }
              metadata {
                __typename
                name
                ... on GeoLocation {
                  name
                  lat
                  lon
                }
                ... on SportsTeam {
                  location {
                    name
                    lat
                    lon
                  }
                }
                ... on TelevisionSeries {
                  season
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
              "category": null,
              "metadata": [],
              "name": "iPhone",
              "price": 699.99,
            },
            {
              "category": {
                "name": "Cooking",
              },
              "metadata": [
                {
                  "__typename": "TelevisionSeries",
                  "name": "Great British Baking Show",
                  "season": 7,
                },
                {
                  "__typename": "GeoLocation",
                  "lat": 55.3781,
                  "lon": 3.436,
                  "name": "Great Britain",
                },
              ],
              "name": "The Best Baking Cookbook",
              "price": 15.99,
            },
            {
              "category": {
                "name": "Travel",
              },
              "metadata": [
                {
                  "__typename": "GeoLocation",
                  "lat": 38.4161,
                  "lon": 63.6167,
                  "name": "Argentina",
                },
              ],
              "name": "Argentina Guidebook",
              "price": 24.99,
            },
            {
              "category": {
                "name": "Sports",
              },
              "metadata": [
                {
                  "__typename": "GeoLocation",
                  "lat": 53.4621,
                  "lon": 2.2766,
                  "name": "Old Trafford, Greater Manchester, England",
                },
                {
                  "__typename": "SportsTeam",
                  "location": {
                    "lat": 53.4621,
                    "lon": 2.2766,
                    "name": "Old Trafford, Greater Manchester, England",
                  },
                  "name": "Manchester United",
                },
              ],
              "name": "Soccer Jersey",
              "price": 47.99,
            },
          ],
        },
      }
    `);
  });
});
