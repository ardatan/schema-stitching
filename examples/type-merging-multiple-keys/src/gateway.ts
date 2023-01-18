import { stitchSchemas } from '@graphql-tools/stitch';
import { createYoga } from 'graphql-yoga';
import { catalogSchema } from './services/catalog';
import { reviewsSchema } from './services/reviews';
import { vendorsSchema } from './services/vendors';

function makeGatewaySchema() {
  return stitchSchemas({
    subschemas: [
      {
        schema: catalogSchema,
        merge: {
          Product: {
            selectionSet: '{ upc }',
            fieldName: 'productsByUpc',
            key: ({ upc }) => upc,
            argsFromKeys: upcs => ({ upcs }),
          },
        },
      },
      {
        schema: vendorsSchema,
        batch: true, // << enable batching to consolidate requests!
        merge: {
          Product: {
            entryPoints: [
              {
                selectionSet: '{ upc }',
                fieldName: 'productsByKey',
                key: ({ upc }) => ({ upc }),
                argsFromKeys: keys => ({ keys }),
              },
              {
                selectionSet: '{ id }',
                fieldName: 'productsByKey',
                key: ({ id }) => ({ id }),
                argsFromKeys: keys => ({ keys }),
              },
            ],
          },
        },
      },
      {
        schema: reviewsSchema,
        merge: {
          Product: {
            selectionSet: '{ id }',
            fieldName: 'productsById',
            key: ({ id }) => id,
            argsFromKeys: ids => ({ ids }),
          },
        },
      },
    ],
  });
}

export const gatewayApp = createYoga({
  schema: makeGatewaySchema(),
  maskedErrors: false,
  graphiql: {
    title: 'Type merging with multiple keys',
    defaultQuery: /* GraphQL */ `
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
  },
});
