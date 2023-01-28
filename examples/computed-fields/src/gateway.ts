import { createYoga } from 'graphql-yoga';
import { stitchSchemas } from '@graphql-tools/stitch';
import { RemoveObjectFieldDeprecations } from '@graphql-tools/wrap';
import { metadataSchema } from './services/metadata';
import { productsSchema } from './services/products';

function makeGatewaySchema() {
  return stitchSchemas({
    subschemas: [
      {
        schema: metadataSchema,
        transforms: [new RemoveObjectFieldDeprecations('gateway access only')],
        batch: true,
        merge: {
          Product: {
            // selectionSet: '{ upc }', << technically not necessary here!
            fields: {
              category: { selectionSet: '{ categoryId }', computed: true },
              metadata: { selectionSet: '{ metadataIds }', computed: true },
            },
            fieldName: '_products',
            key: ({ categoryId, metadataIds }) => ({ categoryId, metadataIds }),
            argsFromKeys: keys => ({ keys }),
          },
        },
      },
      {
        schema: productsSchema,
        batch: true,
      },
    ],
  });
}

export const gatewayApp = createYoga({
  schema: makeGatewaySchema(),
  maskedErrors: false,
  graphiql: {
    title: 'Computed fields',
    defaultQuery: /* GraphQL */ `
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
  },
});
