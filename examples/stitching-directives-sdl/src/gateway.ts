import { buildSchema, parse } from 'graphql';
import { createYoga } from 'graphql-yoga';
import waitOn from 'wait-on';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { isAsyncIterable, type Executor } from '@graphql-tools/utils';

async function makeGatewaySchema() {
  await waitOn({ resources: [4001, 4002, 4003, 4004].map(p => `tcp:${p}`) });
  const { stitchingDirectivesTransformer } = stitchingDirectives();
  const accountsExec = buildHTTPExecutor({ endpoint: 'http://localhost:4001/graphql' });
  const inventoryExec = buildHTTPExecutor({ endpoint: 'http://localhost:4002/graphql' });
  const productsExec = buildHTTPExecutor({ endpoint: 'http://localhost:4003/graphql' });
  const reviewsExec = buildHTTPExecutor({ endpoint: 'http://localhost:4004/graphql' });

  return stitchSchemas({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: [
      {
        schema: await fetchRemoteSchema(accountsExec),
        executor: accountsExec,
      },
      {
        schema: await fetchRemoteSchema(inventoryExec),
        executor: inventoryExec,
      },
      {
        schema: await fetchRemoteSchema(productsExec),
        executor: productsExec,
      },
      {
        schema: await fetchRemoteSchema(reviewsExec),
        executor: reviewsExec,
      },
    ],
  });
}

async function fetchRemoteSchema(executor: Executor) {
  const result = await executor({
    document: parse(/* GraphQL */ `
      {
        _sdl
      }
    `),
  });
  if (isAsyncIterable(result)) {
    throw new Error('Expected executor to return a single result');
  }
  return buildSchema(result.data._sdl);
}

export const gatewayApp = createYoga({
  schema: makeGatewaySchema(),
  maskedErrors: false,
  graphiql: {
    title: 'Stitching directives SDL',
    defaultQuery: /* GraphQL */ `
      query {
        products(upcs: [1, 2]) {
          name
          price
          weight
          inStock
          shippingEstimate
          reviews {
            id
            body
            author {
              name
              username
              totalReviews
            }
            product {
              name
              price
            }
          }
        }
      }
    `,
  },
});
