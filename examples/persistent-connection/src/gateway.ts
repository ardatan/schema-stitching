import { buildGraphQLWSExecutor } from '@graphql-tools/executor-graphql-ws';
import { stitchSchemas } from '@graphql-tools/stitch';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import type { Executor } from '@graphql-tools/utils';
import { parse, buildSchema } from 'graphql';
import { Client } from 'graphql-ws';
import { createYoga, isAsyncIterable } from 'graphql-yoga';

export const clients: Client[] = [];

function onClient(client: Client) {
  clients.push(client);
}

async function makeGatewaySchema() {
  const { stitchingDirectivesTransformer } = stitchingDirectives();
  const productsExec = buildGraphQLWSExecutor({
    url: 'ws://localhost:4001/graphql',
    lazy: false,
    onClient,
  });
  const inventoryExec = buildGraphQLWSExecutor({
    url: 'ws://localhost:4002/graphql',
    lazy: false,
    onClient,
  });

  return stitchSchemas({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: [
      {
        schema: await fetchRemoteSchema(productsExec),
        executor: productsExec,
      },
      {
        schema: await fetchRemoteSchema(inventoryExec),
        executor: inventoryExec,
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
    title: 'Persistent connection',
    defaultQuery: /* GraphQL */ `
      query {
        product1: product(id: "1") {
          id
          name
          stock
        }
        product2: product(id: "2") {
          id
          name
          stock
        }
      }
    `,
  },
});
