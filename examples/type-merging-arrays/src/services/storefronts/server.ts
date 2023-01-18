import { GraphQLError } from 'graphql';
import { createSchema, createYoga } from 'graphql-yoga';
import { createServer } from 'http';

// data fixtures
const storefronts = [
  { id: '1', name: 'eShoppe', productUpcs: ['1', '2'] },
  { id: '2', name: 'BestBooks Online', productUpcs: ['3', '4', '5'] },
];

export const storefrontsServer = createServer(
  createYoga({
    schema: createSchema({
      typeDefs: /* GraphQL */ `
        type Storefront {
          id: ID!
          name: String!
          products: [Product]!
        }

        type Product {
          upc: ID!
        }

        type Query {
          storefront(id: ID!): Storefront
        }
      `,
      resolvers: {
        Query: {
          storefront: (root, { id }) =>
            storefronts.find(s => s.id === id) ||
            new GraphQLError('Record not found', {
              extensions: {
                code: 'NOT_FOUND',
              },
            }),
        },
        Storefront: {
          products: storefront => storefront.productUpcs.map(upc => ({ upc })),
        },
      },
    }),
  })
);
