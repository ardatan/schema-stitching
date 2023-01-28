import { createServer } from 'http';
import { GraphQLError, parse } from 'graphql';
import { createYoga } from 'graphql-yoga';
import { buildSubgraphSchema } from '@apollo/subgraph';

const users = [
  { id: '1', username: 'hanshotfirst', email: 'han@solo.me' },
  { id: '2', username: 'bigvader23', email: 'vader@darkside.io' },
  { id: '3', username: 'yodamecrazy', email: 'yoda@theforce.net' },
];

export const usersServer = createServer(
  createYoga({
    schema: buildSubgraphSchema({
      typeDefs: parse(/* GraphQL */ `
        type User @key(fields: "id") {
          id: ID!
          email: String!
          username: String!
        }

        type Query {
          user(id: ID!): User
        }
      `),
      resolvers: {
        User: {
          __resolveReference: ({ id }) => users.find(user => user.id === id),
        },
        Query: {
          user: (_root, { id }) =>
            users.find(user => user.id === id) ||
            new GraphQLError('Record not found', {
              extensions: {
                code: 'NOT_FOUND',
              },
            }),
        },
      },
    }),
  }),
);
