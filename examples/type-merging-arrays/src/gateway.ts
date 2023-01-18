import waitOn from 'wait-on';
import { stitchSchemas } from '@graphql-tools/stitch';
import { schemaFromExecutor } from '@graphql-tools/wrap';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { print } from 'graphql';
import { createYoga } from 'graphql-yoga';

async function makeGatewaySchema() {
  const manufacturersExec = buildHTTPExecutor({
    endpoint: 'http://localhost:4001/graphql',
  });
  const productsExec = buildHTTPExecutor({
    endpoint: 'http://localhost:4002/graphql',
  });
  const storefrontsExec = buildHTTPExecutor({
    endpoint: 'http://localhost:4003/graphql',
  });

  await waitOn({ resources: ['tcp:4001', 'tcp:4002', 'tcp:4003'] });
  return stitchSchemas({
    subschemas: [
      {
        schema: await schemaFromExecutor(manufacturersExec),
        executor: manufacturersExec,
        batch: true,
        merge: {
          // This schema provides one unique field of data for the `Manufacturer` type (`name`).
          // The gateway needs a query configured so it can fetch this data...
          // this config delegates to `manufacturers(ids: $ids)`.
          Manufacturer: {
            selectionSet: '{ id }',
            fieldName: 'manufacturers',
            key: ({ id }) => id, // pluck a key from each record in the array
            argsFromKeys: ids => ({ ids }), // format all plucked keys into query args
          },
        },
      },
      {
        schema: await schemaFromExecutor(productsExec),
        executor(executorRequest) {
          console.log({
            productsQuery: print(executorRequest.document),
          });
          return productsExec(executorRequest) as any;
        },
        batch: true,
        merge: {
          Manufacturer: {
            // This schema also provides a unique field of data for the `Manufacturer` type (`products`).
            // Therefore, the gateway needs another query configured so it can also fetch this version of the type.
            // This is a _multi-directional_ merge because multiple services contribute unique Manufacturer data.
            // This config delegates to `_manufacturers(ids: $ids)`.
            selectionSet: '{ id }',
            fieldName: '_manufacturers',
            key: ({ id }) => id,
            argsFromKeys: ids => ({ ids }),
          },
          Product: {
            // This service provides _all_ unique fields for the `Product` type.
            // Again, there's unique data here so the gateway needs a query configured to fetch it.
            // This config delegates to `products(upcs: $upcs)`.
            selectionSet: '{ upc }',
            fieldName: 'products',
            key: ({ upc }) => upc,
            argsFromKeys: upcs => ({ upcs }),
            // Compare array-batched logging to the single-record equivalent:
            // fieldName: 'product',
            // args: ({ upc }) => ({ upc }),
          },
        },
      },
      {
        schema: await schemaFromExecutor(storefrontsExec),
        executor: storefrontsExec,
        batch: true,
        // While the Storefronts service also defines a `Product` type,
        // it contains no unique data. The local `Product` type is really just
        // a foreign key (`Product.upc`) that maps to the Products schema.
        // That means the gateway will never need to perform an inbound request
        // to fetch this version of a `Product`, so no merge query config is needed.
      },
    ],
  });
}

export const gatewayApp = createYoga({
  schema: makeGatewaySchema(),
  maskedErrors: false,
  graphiql: {
    title: 'Array-batched type merging',
    defaultQuery: /* GraphQL */ `
      query {
        storefront(id: "2") {
          id
          name
          products {
            upc
            name
            manufacturer {
              products {
                upc
                name
              }
              name
            }
          }
        }
      }
    `,
  },
});
