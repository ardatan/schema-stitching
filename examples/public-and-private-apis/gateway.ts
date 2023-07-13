import { createYoga } from 'graphql-yoga';
import { stitchSchemas } from '@graphql-tools/stitch';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { filterSchema, pruneSchema } from '@graphql-tools/utils';
import { accountsSchema } from './services/accounts';
import { productsSchema } from './services/products';
import { reviewsSchema } from './services/reviews';

const { stitchingDirectivesTransformer } = stitchingDirectives();

function makeGatewaySchema() {
  return stitchSchemas({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: [{ schema: reviewsSchema }, { schema: accountsSchema }, { schema: productsSchema }],
  });
}

// Build public and private versions of the gateway schema:
// - the private schema has all fields, including internal services.
// - the public schema has all underscored name fields removed.
const privateSchema = makeGatewaySchema();
const publicSchema = pruneSchema(
  filterSchema({
    schema: privateSchema,
    rootFieldFilter: (type, fieldName) => !fieldName.startsWith('_'),
    fieldFilter: (type, fieldName) => !fieldName.startsWith('_'),
    argumentFilter: (typeName, fieldName, argName) => !argName.startsWith('_'),
  }),
);

// Serve the public and private schema versions at different locations.
// This allows the public to access one API with reduced features,
// while internal services can authenticate with the private API for all features.
export const gatewayApp = createYoga({
  schema({ request }) {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/private/graphql') return privateSchema;
    return publicSchema;
  },
  maskedErrors: false,
  graphqlEndpoint: '/:scope/graphql',
});
