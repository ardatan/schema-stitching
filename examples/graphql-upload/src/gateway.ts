import { GraphQLError } from 'graphql';
import { createYoga } from 'graphql-yoga';
import waitOn from 'wait-on';
import { delegateToSchema } from '@graphql-tools/delegate';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { schemaFromExecutor } from '@graphql-tools/wrap';

async function makeGatewaySchema() {
  await waitOn({ resources: ['tcp:4001', 'tcp:4002'] });

  // Make remote executors:
  // these are simple functions that query a remote GraphQL API for JSON.
  const uploadFilesExec = buildHTTPExecutor({
    endpoint: 'http://localhost:4001/graphql',
  });
  const uploadFilesSubschema = {
    schema: await schemaFromExecutor(uploadFilesExec),
    executor: uploadFilesExec,
  };
  const resizeImagesExec = buildHTTPExecutor({
    endpoint: 'http://localhost:4002/graphql',
  });
  const resizeImagesSubschema = {
    schema: await schemaFromExecutor(resizeImagesExec),
    executor: resizeImagesExec,
  };

  return stitchSchemas({
    subschemas: [uploadFilesSubschema, resizeImagesSubschema],
    typeDefs: /* GraphQL */ `
      extend type FileEntry {
        resizedBase64(width: Int!, height: Int!): String
      }
    `,
    resolvers: {
      FileEntry: {
        resizedBase64: {
          selectionSet: `{ name type base64 }`,
          resolve(
            { name, type, base64 }: { name: string; type: string; base64: string },
            { width, height },
            context,
            info,
          ) {
            if (!type.startsWith('image/')) {
              throw new GraphQLError('File is not an image');
            }
            const buffer = Buffer.from(base64, 'base64');
            const file = new gatewayApp.fetchAPI.File([buffer], name, { type });
            return delegateToSchema({
              schema: resizeImagesSubschema,
              fieldName: 'resizeImage',
              args: {
                file,
                width,
                height,
              },
              context,
              info,
            });
          },
        },
      },
    },
  });
}

export const gatewayApp = createYoga({
  schema: makeGatewaySchema(),
  maskedErrors: false,
  graphiql: {
    title: 'GraphQL Upload',
    defaultQuery: /* GraphQL */ `
      query {
        readFile(name: "yoga.png") {
          name
          type
          resized(width: 720, height: 405)
        }
      }
    `,
  },
});
