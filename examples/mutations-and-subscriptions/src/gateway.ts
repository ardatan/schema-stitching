import { schemaFromExecutor } from '@graphql-tools/wrap';
import { stitchSchemas } from '@graphql-tools/stitch';
import waitOn from 'wait-on';
import { createYoga } from 'graphql-yoga';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';

async function makeGatewaySchema() {
  await waitOn({ resources: ['tcp:4001', 'tcp:4002'] });

  // build executor functions
  // for communicating with remote services
  const postsExec = buildHTTPExecutor({
    endpoint: 'http://localhost:4001/graphql',
  });
  const usersExec = buildHTTPExecutor({
    endpoint: 'http://localhost:4002/graphql',
  });

  return stitchSchemas({
    subschemas: [
      {
        schema: await schemaFromExecutor(postsExec),
        executor: postsExec,
      },
      {
        schema: await schemaFromExecutor(usersExec),
        executor: usersExec,
        merge: {
          // Combine the User type across services...
          // discussed in chapters three and four.
          User: {
            selectionSet: '{ id }',
            fieldName: 'user',
            args: ({ id }) => ({ id }),
          },
        },
      },
    ],
  });
}

export const gatewayApp = createYoga({
  schema: makeGatewaySchema(),
  maskedErrors: false,
  graphiql: {
    defaultQuery: /* GraphQL */ `
      query Posts {
        posts {
          id
          message
          user {
            username
            email
          }
        }
      }

      mutation CreatePost {
        createPost(message: "hello world") {
          id
          message
          user {
            username
            email
          }
        }
      }

      subscription OnNewPost {
        newPost {
          id
          message
          user {
            id
            username
            email
          }
        }
      }
    `,
  },
});
