import { createYoga, YogaServerInstance } from 'graphql-yoga';
import waitOn from 'wait-on';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { schemaFromExecutor } from '@graphql-tools/wrap';

type YogaFetch = YogaServerInstance<any, any>['fetch'];

async function makeGatewaySchema({
  waitForPorts,
  postsFetch,
  usersFetch,
}: {
  waitForPorts?: boolean;
  postsFetch?: YogaFetch;
  usersFetch?: YogaFetch;
} = {}) {
  if (waitForPorts) {
    await waitOn({ resources: ['tcp:4001', 'tcp:4002'] });
  }

  // build executor functions
  // for communicating with remote services
  const postsExec = buildHTTPExecutor({
    endpoint: 'http://localhost:4001/graphql',
    fetch: postsFetch,
  });
  const usersExec = buildHTTPExecutor({
    endpoint: 'http://localhost:4002/graphql',
    fetch: usersFetch,
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

export function makeGatewayApp({
  waitForPorts,
  postsFetch,
  usersFetch,
}: {
  waitForPorts?: boolean;
  postsFetch?: YogaFetch;
  usersFetch?: YogaFetch;
} = {}) {
  return createYoga({
    schema: makeGatewaySchema({
      waitForPorts,
      postsFetch,
      usersFetch,
    }),
    maskedErrors: false,
    graphiql: {
      title: 'Mutations & subscriptions',
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
}
