import { createServer, Server } from 'http';
import { buildSchema, GraphQLSchema } from 'graphql';
import { createYoga } from 'graphql-yoga';
import waitOn from 'wait-on';
import { SubschemaConfig } from '@graphql-tools/delegate';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { SchemaLoader } from './SchemaLoader';
import { makeEndpointsSchema } from './services/endpoints';

const { stitchingDirectivesTransformer } = stitchingDirectives();

const loader = new SchemaLoader(
  function buildSchemaFromEndpoints(loadedEndpoints) {
    const subschemas: SubschemaConfig[] = loadedEndpoints.map(({ sdl, url }) => ({
      schema: buildSchema(sdl),
      executor: buildHTTPExecutor({
        endpoint: url,
        timeout: 5000,
      }),
      batch: true,
    }));

    subschemas.push(makeEndpointsSchema(loader));

    return stitchSchemas({
      subschemaConfigTransforms: [stitchingDirectivesTransformer],
      subschemas,
    });
  },
  ['http://localhost:4001/graphql', 'http://localhost:4002/graphql'],
);

const server = createServer(
  createYoga({
    schema: () => loader.schema,
    maskedErrors: false,
    graphiql: {
      title: 'Hot schema reloading',
    },
  }),
);
export async function startServer() {
  await waitOn({ resources: [4001, 4002].map(p => `tcp:${p}`) });
  await loader.reload();
  await new Promise<void>(resolve => server.listen(4000, resolve));
  console.log('Gateway started on http://localhost:4000');
}

export async function stopServer() {
  loader.stopAutoRefresh();
  await new Promise(resolve => server.close(resolve));
}
