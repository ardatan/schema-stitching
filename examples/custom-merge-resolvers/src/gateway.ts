import { createYoga } from 'graphql-yoga';
import { stitchSchemas } from '@graphql-tools/stitch';
import { infoSchema } from './services/info';
import { createInventoryResolver, inventorySchema } from './services/inventory';
import { createPricingResolver, pricingSchema } from './services/pricing';

function makeGatewaySchema() {
  // For simplicity, all services run locally in this example.
  // Any of these services could easily be turned into a remote server (see Example 1).
  return stitchSchemas({
    subschemas: [
      {
        schema: infoSchema,
        merge: {
          Product: {
            selectionSet: '{ id }',
            fieldName: 'productsInfo',
            key: ({ id }) => id,
            argsFromKeys: ids => ({ whereIn: ids }),
            valuesFromResults: (results, keys) => {
              const valuesByKey = Object.create(null);
              for (const val of results) valuesByKey[val.id] = val;
              return keys.map(key => valuesByKey[key] || null);
            },
          },
        },
      },
      {
        schema: inventorySchema,
        merge: {
          Product: {
            selectionSet: '{ id }',
            key: ({ id }) => id,
            resolve: createInventoryResolver({
              fieldName: 'productsInventory',
              argsFromKeys: ids => ({ ids }),
            }),
          },
        },
      },
      {
        schema: pricingSchema,
        merge: {
          Product: {
            selectionSet: '{ id }',
            key: ({ id }) => id,
            resolve: createPricingResolver(),
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
    title: 'Custom merge resolvers',
    defaultQuery: /* GraphQL */ `
      query {
        productsInfo(whereIn: ["1", "X", "2", "3"]) {
          id
          title
          totalInventory
          price
        }
      }
    `,
  },
});
