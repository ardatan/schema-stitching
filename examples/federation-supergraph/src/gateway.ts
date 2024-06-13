import { readFileSync } from 'fs';
import { join } from 'path';
import { createYoga } from 'graphql-yoga';
import { getStitchedSchemaFromSupergraphSdl } from '@graphql-tools/federation';
import { exampleQuery } from './example-query';

export const yoga = createYoga({
  schema: getStitchedSchemaFromSupergraphSdl({
    supergraphSdl: readFileSync(join(__dirname, 'supergraph.graphql'), 'utf8'),
  }),
  graphiql: {
    defaultQuery: exampleQuery,
  },
});
