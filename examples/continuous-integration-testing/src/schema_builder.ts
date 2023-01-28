import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSchema } from 'graphql';
import { SubschemaConfig } from '@graphql-tools/delegate';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import config from './config.json';

export function buildSubschemaConfigs(): Record<string, SubschemaConfig> {
  return Object.entries(config.services).reduce((memo, [name, settings]) => {
    const sdl = readFileSync(join(__dirname, `./remote_schemas/${name}.graphql`), 'utf-8');
    memo[name] = {
      schema: buildSchema(sdl),
      executor: buildHTTPExecutor({ endpoint: settings.url }),
      batch: true,
    };
    return memo;
  }, {});
}

export function buildGatewaySchema(subschemasByName: Record<string, SubschemaConfig>) {
  const { stitchingDirectivesTransformer } = stitchingDirectives();

  return stitchSchemas({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: Object.values(subschemasByName),
  });
}
