import {
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLError,
  GraphQLNonNull,
  GraphQLString,
  GraphQLID,
  specifiedDirectives,
} from 'graphql';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { printSchemaWithDirectives } from '@graphql-tools/utils';
import { createServer } from 'http';
import { createYoga } from 'graphql-yoga';

const { allStitchingDirectives, stitchingDirectivesValidator } = stitchingDirectives();

const users = [
  { id: '1', name: 'Ada Lovelace', username: '@ada' },
  { id: '2', name: 'Alan Turing', username: '@complete' },
];

const accountsSchemaTypes = Object.create(null);

accountsSchemaTypes._Key = new GraphQLScalarType({
  name: '_Key',
});
accountsSchemaTypes.Query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    me: {
      type: accountsSchemaTypes.User,
      resolve: () => users[0],
    },
    user: {
      type: accountsSchemaTypes.User,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: (_root, { id }) =>
        users.find(user => user.id === id) ||
        new GraphQLError('Record not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        }),
      extensions: { directives: { merge: { keyField: 'id' } } },
    },
    _sdl: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(_root, _args, _context, info) {
        return printSchemaWithDirectives(info.schema);
      },
    },
  }),
});

accountsSchemaTypes.User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    username: { type: GraphQLString },
  }),
  extensions: {
    directives: {
      key: {
        selectionSet: '{ id }',
      },
    },
  },
});

const accountsSchema = new GraphQLSchema({
  query: accountsSchemaTypes.Query,
  directives: [...specifiedDirectives, ...allStitchingDirectives],
});

export const accountsServer = createServer(createYoga({
    schema: stitchingDirectivesValidator(accountsSchema)
}))