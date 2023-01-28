import { createYoga } from 'graphql-yoga';
import { stitchSchemas } from '@graphql-tools/stitch';
import { productsSchema } from './services/products';
import { storefrontsSchema } from './services/storefronts';

function makeGatewaySchema() {
  // For simplicity, all services run locally in this example.
  // Any of these services could easily be turned into a remote server (see Example 1).
  return stitchSchemas({
    subschemas: [
      {
        schema: productsSchema,
        batch: true,
        merge: {
          Product: {
            selectionSet: '{ id }',
            fieldName: 'products',
            key: ({ id }) => id,
            argsFromKeys: ids => ({ ids }),
          },
        },
      },
      {
        schema: storefrontsSchema,
        batch: true,
      },
    ],
  });
}

export const gatewayApp = createYoga({
  schema: makeGatewaySchema(),
  maskedErrors: false,
  graphiql: {
    title: 'Cross-service interfaces',
    defaultQuery: /* GraphQL */ `
      query {
        storefront(id: "1") {
          id
          name
          productOfferings {
            __typename
            id
            name
            price
            ... on ProductDeal {
              products {
                name
                price
              }
            }
          }
        }
      }
    `,
  },
});
