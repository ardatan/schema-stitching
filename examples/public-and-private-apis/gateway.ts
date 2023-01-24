import { stitchSchemas } from '@graphql-tools/stitch';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { pruneSchema, filterSchema } from '@graphql-tools/utils';
import { createRouter } from '@whatwg-node/router';
import { createYoga } from 'graphql-yoga';
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
  })
);

// Serve the public and private schema versions at different locations.
// This allows the public to access one API with reduced features,
// while internal services can authenticate with the private API for all features.
export const gatewayApp = createRouter();

gatewayApp.all(
  '/private/graphql',
  createYoga({
    schema: privateSchema,
    maskedErrors: false,
    graphqlEndpoint: '/private/graphql',
    graphiql: {
      title: 'Private API',
    },
  })
);

gatewayApp.all(
  '/public/graphql',
  createYoga({
    schema: publicSchema,
    maskedErrors: false,
    graphqlEndpoint: '/public/graphql',
    graphiql: {
      title: 'Public API',
    },
  })
);
