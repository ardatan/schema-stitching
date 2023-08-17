import { readFileSync } from 'fs';
import { join } from 'path';
import { createYoga } from 'graphql-yoga';
import { getStitchedSchemaFromSupergraphSdl } from '@graphql-tools/federation';
import { exampleQuery } from './example-query';

const supergraphSdl = readFileSync(join(__dirname, 'supergraph.graphql'), 'utf8');

const schema$ = getStitchedSchemaFromSupergraphSdl({ supergraphSdl });

export const yoga = createYoga({
  schema: schema$,
  graphiql: {
    defaultQuery: exampleQuery,
  },
});
