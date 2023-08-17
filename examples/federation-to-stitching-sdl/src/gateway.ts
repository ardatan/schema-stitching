import { buildSchema, parse } from 'graphql';
import { createYoga, isAsyncIterable } from 'graphql-yoga';
import waitOn from 'wait-on';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { federationToStitchingSDL, stitchingDirectives } from '@graphql-tools/stitching-directives';
import { Executor } from '@graphql-tools/utils';

const SDL_QUERY = parse(/* GraphQL */ `
  query GetSDL {
    _service {
      sdl
    }
  }
`);

async function fetchFederationSubschema(executor: Executor) {
  const result = await executor({ document: SDL_QUERY });
  if (isAsyncIterable(result)) {
    throw new Error('Executor returned an AsyncIterable, which is not supported');
  }
  const sdl = federationToStitchingSDL(result.data._service.sdl);
  return {
    schema: buildSchema(sdl, {
      assumeValidSDL: true,
      assumeValid: true,
    }),
    executor,
  };
}

async function makeGatewaySchema() {
  await waitOn({ resources: [4001, 4002, 4003].map(p => `tcp:${p}`) });
  const { stitchingDirectivesTransformer } = stitchingDirectives();
  return stitchSchemas({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: await Promise.all([
      fetchFederationSubschema(buildHTTPExecutor({ endpoint: 'http://localhost:4001/graphql' })),
      fetchFederationSubschema(buildHTTPExecutor({ endpoint: 'http://localhost:4002/graphql' })),
      fetchFederationSubschema(buildHTTPExecutor({ endpoint: 'http://localhost:4003/graphql' })),
    ]),
  });
}

export const gatewayApp = createYoga({
  schema: makeGatewaySchema(),
  maskedErrors: false,
  graphiql: {
    title: 'Federation services',
    defaultQuery: /* GraphQL */ `
      query {
        user(id: "1") {
          username
          recentPurchases {
            upc
            name
          }
          reviews {
            body
            author {
              id
              username
            }
            product {
              upc
              name
              acceptsNewReviews
            }
          }
        }
      }
    `,
  },
});
