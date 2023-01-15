import { AsyncFetchFn, buildHTTPExecutor } from '@graphql-tools/executor-http';
import { parse } from 'graphql';
import { gatewayApp } from '../src/gateway';
import { server as postsServer } from '../src/services/posts/server';
import { server as usersServer } from '../src/services/users/server';

function assertAsyncIterable<T>(value: any): asserts value is AsyncIterable<T> {
  if (!(Symbol.asyncIterator in value)) {
    throw new Error('Value is not async iterable');
  }
}

describe('Mutations & Subscriptions', () => {
  beforeAll(async () => {
    await Promise.all([
      new Promise<void>(resolve => postsServer.listen(4001, resolve)),
      new Promise<void>(resolve => usersServer.listen(4002, resolve)),
    ]);
  });
  afterAll(async () => {
    await Promise.all([
      new Promise<any>(resolve => postsServer.close(resolve)),
      new Promise<any>(resolve => usersServer.close(resolve)),
    ]);
  });
  it('should have the consistent behavior', async () => {
    expect.assertions(2);
    const executorForGateway = buildHTTPExecutor({
      endpoint: 'http://localhost:4000/graphql',
      fetch: gatewayApp.fetch as AsyncFetchFn,
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
