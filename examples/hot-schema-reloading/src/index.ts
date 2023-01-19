import { createYoga } from 'graphql-yoga';
import { stitchSchemas } from '@graphql-tools/stitch';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { SubschemaConfig } from '@graphql-tools/delegate';
import { buildSchema, GraphQLSchema } from 'graphql';
import { SchemaLoader } from './SchemaLoader';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { makeEndpointsSchema } from './services/endpoints';
import { createServer } from 'http';
import waitOn from 'wait-on';

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
  ['http://localhost:4001/graphql', 'http://localhost:4002/graphql']
);

async function main() {
  await waitOn({ resources: [4001, 4002].map(p => `tcp:${p}`) });
  await loader.reload();
  createServer(
    createYoga({
      schema: () => loader.schema,
      maskedErrors: false,
      graphiql: {
        title: 'Hot schema reloading',
      },
    })
  ).listen(4000, () => {
    console.log('Gateway started on http://localhost:4000');
  });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
