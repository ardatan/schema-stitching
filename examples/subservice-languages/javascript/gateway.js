import { stitchSchemas } from '@graphql-tools/stitch';
import { buildSchema, parse } from 'graphql';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { createYoga } from 'graphql-yoga';
import waitOn from 'wait-on';

const { stitchingDirectivesTransformer } = stitchingDirectives();

async function makeGatewaySchema() {
  await waitOn({ resources: ['tcp:4001', 'tcp:4002', 'tcp:4003', 'tcp:4004'] });
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

const SDL_QUERY = parse(/* GraphQL */ `
  query {
    _sdl
  }
`);

// fetch remote schemas with a retry loop
// (allows the gateway to wait for all services to startup)
async function fetchRemoteSchema(executor) {
  const result = await executor({ document: SDL_QUERY });
  return buildSchema(result.data._sdl);
}

export const gatewayApp = createYoga({
  schema: makeGatewaySchema(),
  maskedErrors: false,
  graphiql: {
    title: 'JavaScript Code-First Schemas',
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
