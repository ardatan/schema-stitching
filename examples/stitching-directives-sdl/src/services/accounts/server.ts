import { createServer } from 'http';
import { GraphQLError } from 'graphql';
import { createSchema, createYoga } from 'graphql-yoga';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';

const { stitchingDirectivesTypeDefs, stitchingDirectivesValidator } = stitchingDirectives();

const typeDefs = /* GraphQL */ `
  ${stitchingDirectivesTypeDefs}
  type User {
    id: ID!
    name: String!
    username: String!
  }

  type Query {
    me: User
    user(id: ID!): User @merge(keyField: "id")
    _sdl: String!
  }
`;

const users = [
  { id: '1', name: 'Ada Lovelace', username: '@ada' },
  { id: '2', name: 'Alan Turing', username: '@complete' },
];

export const accountsServer = createServer(
  createYoga({
    schema: stitchingDirectivesValidator(
      createSchema({
        typeDefs,
        resolvers: {
          Query: {
            me: () => users[0],
            user: (_root, { id }) =>
              users.find(user => user.id === id) ||
              new GraphQLError('Record not found', {
                extensions: {
                  code: 'NOT_FOUND',
                },
              }),
            _sdl: () => typeDefs,
          },
        },
      }),
    ),
  }),
);
