import { createServer } from 'http';
import { buildSchema } from 'graphql';
import { createYoga } from 'graphql-yoga';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { SchemaRegistry } from './schema_registry';
import { makeRegistrySchema } from './services/registry';

async function main() {
  const ENV = process.env.NODE_ENV || 'development';

  const repo = await import('./repo.json').catch(() => {
    throw new Error('Make a local "repo.json" file based on "repo.template.json"');
  });

  const { stitchingDirectivesTransformer } = stitchingDirectives();

  const registry = new SchemaRegistry({
    env: ENV,
    repo,
    endpoints: [
      {
        name: 'inventory',
        url: {
          development: 'http://localhost:4001/graphql',
          production: 'http://localhost:4001/graphql?env=production',
        },
      },
      {
        name: 'products',
        url: {
          development: 'http://localhost:4002/graphql',
          production: 'http://localhost:4002/graphql?env=production',
        },
      },
    ],
    async buildSchema(services) {
      const subschemas = services.map(({ url, sdl }) => ({
        schema: buildSchema(sdl),
        executor: buildHTTPExecutor({ endpoint: url, timeout: 5000 }),
        batch: true,
      }));

      if (ENV === 'development') {
        subschemas.push({ schema: makeRegistrySchema(registry) });
      }

      return stitchSchemas({
        subschemaConfigTransforms: [stitchingDirectivesTransformer],
        subschemas,
        // Includes a "reload" mutation directly in the gateway proxy layer...
        // allows a reload to be triggered manually rather than just by polling
        // (filter this mutation out of public APIs!)
        typeDefs: /* GraphQL */ `
          type Mutation {
            _reloadGateway: Boolean!
          }
        `,
        resolvers: {
          Mutation: {
            _reloadGateway: async () => !!(await registry.reload()),
          },
        },
      });
    },
  });

  await registry.reload();
  const port = ENV === 'development' ? 4000 : 4444;
  const app = createYoga({
    schema: () => registry.schema,
  });
  const server = createServer(app);
  server.listen(port, () => console.log(`${ENV} gateway running http://localhost:${port}/graphql`));
  if (ENV === 'production') {
    registry.autoRefresh();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
