import { stitchSchemas } from '@graphql-tools/stitch';
import { productsSchema } from './services/products';
import { reviewsSchema } from './services/reviews';
import { usersSchema } from './services/users';
import { createYoga } from 'graphql-yoga';

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
            selectionSet: '{ upc }',
            fieldName: 'products',
            key: ({ upc }) => upc,
            argsFromKeys: upcs => ({ upcs }),
          },
        },
      },
      {
        schema: reviewsSchema,
        batch: true,
        merge: {
          Product: {
            selectionSet: '{ upc }',
            fieldName: '_products',
            key: ({ upc }) => upc,
            argsFromKeys: upcs => ({ upcs }),
          },
          User: {
            selectionSet: '{ id }',
            fieldName: '_users',
            key: ({ id }) => id,
            argsFromKeys: ids => ({ ids }),
          },
        },
      },
      {
        schema: usersSchema,
        batch: true,
        merge: {
          User: {
            selectionSet: '{ id }',
            fieldName: 'users',
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
    title: 'Nullable merges',
    defaultQuery: /* GraphQL */ `
      query AllInOne {
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

      query DoesntExistUser {
        _users(ids: ["DOES_NOT_EXIST"]) {
          id
          reviews {
            body
          }
        }
      }

      query DoesntExistProduct {
        _products(upcs: ["DOES_NOT_EXIST"]) {
          upc
          reviews {
            body
          }
        }
      }
    `,
  },
});
