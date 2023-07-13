import { createServer } from 'http';
import { GraphQLError } from 'graphql';
import { createSchema, createYoga } from 'graphql-yoga';

const users = [
  { id: '1', username: 'hanshotfirst', email: 'han@solo.me' },
  { id: '2', username: 'bigvader23', email: 'vader@darkside.io' },
  { id: '3', username: 'yodamecrazy', email: 'yoda@theforce.net' },
];

export const app = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type User {
        id: ID!
        username: String!
        email: String!
      }

      type Query {
        user(id: ID!): User
      }
    `,
    resolvers: {
      Query: {
        user: (root, { id }) =>
          users.find(user => user.id === id) ||
          new GraphQLError('Record not found', {
            extensions: {
              code: 'NOT_FOUND',
            },
          }),
      },
    },
  }),
});

export const server = createServer(app);
