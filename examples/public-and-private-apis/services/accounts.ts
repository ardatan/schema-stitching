import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { GraphQLError } from 'graphql';
import { createSchema } from 'graphql-yoga';

const { stitchingDirectivesTypeDefs, stitchingDirectivesValidator } = stitchingDirectives();

const typeDefs = /* GraphQL */ `
  ${stitchingDirectivesTypeDefs}
  "Represents a human user with an account."
  type User @canonical {
    "The primary key of this user."
    id: ID!
    "A formal display name for this user."
    name: String!
    "An alpha-numeric handle for this user."
    username: String!
  }

  type Query {
    "Specifies the current user, or null when anonymous."
    me: User
    "Fetches a User by ID reference."
    user(id: ID!): User @merge(keyField: "id")
    _sdl: String!
  }
`;

const users = [
  { id: '1', name: 'Ada Lovelace', username: '@ada' },
  { id: '2', name: 'Alan Turing', username: '@complete' },
];

export const accountsSchema = stitchingDirectivesValidator(
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
  })
);
