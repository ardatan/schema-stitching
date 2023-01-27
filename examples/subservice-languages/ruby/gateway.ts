import { buildSchema, parse } from 'graphql';
import { Executor } from '@graphql-tools/utils';
import { createYoga, isAsyncIterable } from 'graphql-yoga';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import waitOn from 'wait-on';

const SDL_QUERY = parse(/* GraphQL */ `
  query {
    _sdl
  }
`);

async function fetchRemoteSchema(executor: Executor) {
  const result = await executor({ document: SDL_QUERY });
  if (isAsyncIterable(result)) {
    throw new Error('Executor must return a Promise or Observable');
  }
  return buildSchema(result.data._sdl);
}

async function makeGatewaySchema() {
  await waitOn({ resources: ['tcp:4001', 'tcp:4002', 'tcp:4003'] });
  const { stitchingDirectivesTransformer } = stitchingDirectives();
  const accountsExec = buildHTTPExecutor({ endpoint: 'http://localhost:4001/graphql' });
  const productsExec = buildHTTPExecutor({ endpoint: 'http://localhost:4002/graphql' });
  const reviewsExec = buildHTTPExecutor({ endpoint: 'http://localhost:4003/graphql' });

  return stitchSchemas({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: [
      {
        schema: await fetchRemoteSchema(accountsExec),
        executor: accountsExec,
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

export const gatewayApp = createYoga({
  schema: makeGatewaySchema(),
  maskedErrors: false,
  graphiql: {
    title: 'Ruby subservices',
    defaultQuery: /* GraphQL */ `
      query {
        users(ids: ["1", "2"]) {
          id
          name
          username
          reviews {
            body
            product {
              name
            }
          }
        }
      }
    `,
  },
});
