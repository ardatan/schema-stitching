import { buildSubgraphSchema } from '@apollo/subgraph';
import { parse } from 'graphql';
import { createYoga } from 'graphql-yoga';
import { createServer } from 'http';

const reviews = [
  { id: '1', userId: '1', productUpc: '1', body: 'Love it!' },
  { id: '2', userId: '1', productUpc: '2', body: 'Too expensive.' },
  { id: '3', userId: '2', productUpc: '3', body: 'Could be better.' },
  { id: '4', userId: '3', productUpc: '1', body: 'Prefer something else.' },
];

export const reviewsServer = createServer(
  createYoga({
    schema: buildSubgraphSchema({
      typeDefs: parse(/* GraphQL */ `
        type Review @key(fields: "id") {
          id: ID!
          body: String!
          author: User
          product: Product
        }

        extend type User @key(fields: "id") {
          id: ID! @external
          reviews: [Review]
        }

        extend type Product @key(fields: "upc") {
          acceptsNewReviews: Boolean @requires(fields: "unitsInStock")
          reviews: [Review]
          unitsInStock: Int @external
          upc: ID! @external
        }
      `),
      resolvers: {
        Review: {
          __resolveReference: ({ id }) => reviews.find(review => review.id === id),
          author: review => ({ id: review.userId }),
          product: review => ({ upc: review.productUpc }),
        },
        Product: {
          reviews: product => reviews.filter(review => review.productUpc === product.upc),
          acceptsNewReviews: product => product.unitsInStock > 0,
        },
        User: {
          reviews: user => reviews.filter(review => review.userId === user.id),
        },
      },
    }),
  })
);
