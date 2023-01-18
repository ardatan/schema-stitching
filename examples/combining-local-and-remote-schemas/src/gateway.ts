import waitOn from 'wait-on';
import { createYoga } from 'graphql-yoga';
import { schemaFromExecutor, RenameTypes, RenameRootFields } from '@graphql-tools/wrap';
import { Executor } from '@graphql-tools/utils';
import { stitchSchemas } from '@graphql-tools/stitch';
import { buildSchema, parse } from 'graphql';
import { localSchema } from './services/local/schema';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';

async function makeGatewaySchema() {
  await waitOn({ resources: ['tcp:4001', 'tcp:4002'] });
  // Make remote executors:
  // these are simple functions that query a remote GraphQL API for JSON.
  const productsExec = buildHTTPExecutor({
    endpoint: 'http://localhost:4001/graphql',
    headers: executorRequest => executorRequest?.context?.authHeader,
  });
  const storefrontsExec = buildHTTPExecutor({
    endpoint: 'http://localhost:4002/graphql',
    headers: executorRequest => executorRequest?.context?.authHeader,
  });
  const rainforestApiExec = buildHTTPExecutor({
    endpoint: 'http://localhost:4001/graphql',
    headers: executorRequest => executorRequest?.context?.authHeader,
  });
  const adminContext = { authHeader: 'Bearer my-app-to-app-token' };

  return stitchSchemas({
    subschemas: [
      {
        // 1. Introspect a remote schema. Simple, but there are caveats:
        // - Remote server must enable introspection.
        // - Custom directives are not included in introspection.
        schema: await schemaFromExecutor(productsExec, adminContext),
        executor: productsExec,
      },
      {
        // 2. Manually fetch a remote SDL string, then build it into a simple schema.
        // - Use any strategy to load the SDL: query it via GraphQL, load it from a repo, etc.
        // - Allows the remote schema to include custom directives.
        schema: buildSchema(await fetchRemoteSDL(storefrontsExec, adminContext)),
        executor: storefrontsExec,
      },
      {
        // 3. Integrate a schema that conflicts with another schema.
        // Let's pretend that "Rainforest API" executor talks to an API that
        // we don't control (say, a product database named after a rainforest...),
        // and the naming in this third-party API conflicts with our schemas.
        // In this case, transforms may be used to integrate the third-party schema
        // with remapped names (and/or numerous other transformations).
        schema: await schemaFromExecutor(rainforestApiExec, adminContext),
        executor: rainforestApiExec,
        transforms: [
          new RenameTypes(name => `Rainforest${name}`),
          new RenameRootFields((op, name) => `rainforest${name.charAt(0).toUpperCase()}${name.slice(1)}`),
        ],
      },
      {
        // 4. Incorporate a locally-executable subschema.
        // No need for a remote executor!
        // Note that that the gateway still proxies through
        // to this same underlying executable schema instance.
        schema: localSchema,
      },
    ],
    // 5. Add additional schema directly into the gateway proxy layer.
    // Under the hood, `stitchSchemas` is a wrapper for `makeExecutableSchema`,
    // and accepts all of its same options. This allows extra type definitions
    // and resolvers to be added directly into the top-level gateway proxy schema.
    typeDefs: 'type Query { heartbeat: String! }',
    resolvers: {
      Query: {
        heartbeat: () => 'OK',
      },
    },
  });
}

// Custom fetcher that queries a remote schema for an "sdl" field.
// This is NOT a standard GraphQL convention – it's just a simple way
// for a remote API to provide its own schema, complete with custom directives.
async function fetchRemoteSDL(executor: Executor, context: any) {
  const result = await executor({
    document: parse(/* GraphQL */ `
      {
        _sdl
      }
    `),
    context,
  });
  if ('data' in result && '_sdl' in result.data) {
    return result.data._sdl;
  }
  throw new Error('Could not fetch remote schema');
}

export const gatewayApp = createYoga({
  schema: makeGatewaySchema(),
  context: ({ request }) => ({
    authHeader: request.headers.get('authorization'),
  }),
  maskedErrors: false,
  graphiql: {
    title: 'Combining local and remote schemas',
    defaultQuery: /* GraphQL */ `
      query FullExample {
        product(upc: "1") {
          upc
          name
        }
        rainforestProduct(upc: "2") {
          upc
          name
        }
        storefront(id: "2") {
          id
          name
        }
        errorCodes
        heartbeat
      }

      query FailingExample {
        product(upc: "99") {
          upc
          name
        }
      }
    `,
  },
});
