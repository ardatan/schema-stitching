import { GraphQLError } from 'graphql';
import { createSchema, createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';

// data fixtures
const manufacturers = [
  { id: '1', name: 'Apple' },
  { id: '2', name: 'Macmillan' },
];

export const manufacturerServer = createServer(
  createYoga({
    schema: createSchema({
      typeDefs: /* GraphQL */ `
        type Manufacturer {
          id: ID!
          name: String!
        }

        type Query {
          manufacturer(id: ID!): Manufacturer
        }
      `,
      resolvers: {
        Query: {
          manufacturer: (root, { id }) =>
            manufacturers.find(m => m.id === id) ||
            new GraphQLError('Record not found', {
              extensions: {
                code: 'NOT_FOUND',
              },
            }),
        },
      },
    }),
  })
);
