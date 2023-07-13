import { parse } from 'graphql';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { makeGatewayApp } from '../src/gateway';
import { app as postsApp } from '../src/services/posts/server';
import { app as usersApp } from '../src/services/users/server';

function assertAsyncIterable<T>(value: any): asserts value is AsyncIterable<T> {
  if (!(Symbol.asyncIterator in value)) {
    throw new Error('Value is not async iterable');
  }
}

describe('Mutations & Subscriptions', () => {
  const gatewayApp = makeGatewayApp({
    waitForPorts: false,
    postsFetch: postsApp.fetch,
    usersFetch: usersApp.fetch,
  });
  it('should have the consistent behavior', async () => {
    expect.assertions(2);
    const executorForGateway = buildHTTPExecutor({
      endpoint: 'http://localhost:4000/graphql',
      fetch: gatewayApp.fetch,
    });
    let expectedPost: any;
    setTimeout(async () => {
      const mutationResult = await executorForGateway({
        document: parse(/* GraphQL */ `
          mutation {
            createPost(message: "hello world") {
              id
              message
              user {
                username
                email
              }
            }
          }
        `),
      });
      if (Symbol.asyncIterator in mutationResult) {
        throw new Error('Value is async iterable');
      }
      expectedPost = mutationResult.data.createPost;
    }, 100);
    const subscriptionResult = await executorForGateway({
      document: parse(/* GraphQL */ `
        subscription {
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
      `),
    });
    assertAsyncIterable(subscriptionResult);
    // eslint-disable-next-line no-unreachable-loop
    for await (const result of subscriptionResult) {
      expect(result).toMatchObject({
        data: {
          newPost: expectedPost,
        },
      });
      break;
    }
    const queryResult = await executorForGateway({
      document: parse(/* GraphQL */ `
        query {
          posts {
            id
            message
            user {
              username
              email
            }
          }
        }
      `),
    });
    if (Symbol.asyncIterator in queryResult) {
      throw new Error('Value is async iterable');
    }
    expect(queryResult).toMatchObject({
      data: {
        posts: [expectedPost],
      },
    });
  });
});
