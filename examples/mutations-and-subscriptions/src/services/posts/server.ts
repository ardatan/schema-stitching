import { createServer } from 'http';
import { createPubSub, createSchema, createYoga } from 'graphql-yoga';

const pubsub = createPubSub();
const posts = [];
const NEW_POST = 'new_post';

export const app = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Post {
        id: ID!
        message: String!
        user: User
      }

      type User {
        id: ID!
      }

      type Query {
        posts: [Post]!
      }

      type Mutation {
        createPost(message: String!): Post!
      }

      type Subscription {
        newPost: Post!
      }
    `,
    resolvers: {
      Post: {
        user: post => ({ id: post.userId }),
      },
      Query: {
        posts: () => posts,
      },
      Mutation: {
        createPost: (root, { message }) => {
          const newPost = {
            id: posts.length + 1,
            userId: String(Math.round(Math.random() * 2) + 1),
            message,
          };

          posts.push(newPost);
          pubsub.publish(NEW_POST, { newPost });
          return newPost;
        },
      },
      Subscription: {
        newPost: {
          subscribe: () => pubsub.subscribe(NEW_POST),
        },
      },
    },
  }),
});

export const server = createServer(app);
