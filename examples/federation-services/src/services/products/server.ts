import { GraphQLError, parse } from 'graphql';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { createYoga } from 'graphql-yoga';
import { createServer } from 'http';

const products = [
  { upc: '1', name: 'iPhone', price: 699.99, unitsInStock: 7 },
  { upc: '2', name: 'Super Baking Cookbook', price: 15.99, unitsInStock: 0 },
  { upc: '3', name: 'Best Selling Novel', price: 7.99, unitsInStock: 25 },
  { upc: '4', name: 'iOS Survival Guide', price: 24.99, unitsInStock: 150 },
];

const productPurchases = [
  { productUpc: '1', userId: '1' },
  { productUpc: '4', userId: '1' },
  { productUpc: '1', userId: '2' },
  { productUpc: '3', userId: '2' },
  { productUpc: '2', userId: '3' },
];

export const productsServer = createServer(
  createYoga({
    schema: buildSubgraphSchema({
      typeDefs: parse(/* GraphQL */ `
        type Product @key(fields: "upc") {
          upc: ID!
          name: String!
          price: Float!
          unitsInStock: Int!
        }

        extend type User @key(fields: "id") {
          id: ID! @external
          recentPurchases: [Product]
        }

        type Query {
          product(upc: ID!): Product
        }
      `),
      resolvers: {
        Product: {
          __resolveReference: ({ upc }) => products.find(product => product.upc === upc),
        },
        User: {
          recentPurchases(user) {
            const upcs = productPurchases
              .filter(({ userId }) => userId === user.id)
              .map(({ productUpc }) => productUpc);
            return upcs.map(
              upc =>
                products.find(p => p.upc === upc) ||
                new GraphQLError('Record not found', {
                  extensions: {
                    code: 'NOT_FOUND',
                  },
                })
            );
          },
        },
        Query: {
          product: (_root, { upc }) =>
            products.find(p => p.upc === upc) ||
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
