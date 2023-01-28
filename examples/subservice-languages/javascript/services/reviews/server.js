import { createServer } from 'http';
import { GraphQLError } from 'graphql';
import { createSchema, createYoga } from 'graphql-yoga';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';

const { stitchingDirectivesTypeDefs, stitchingDirectivesValidator } = stitchingDirectives();

const typeDefs = /* GraphQL */ `
  ${stitchingDirectivesTypeDefs}
  type Review {
    id: ID!
    body: String
    author: User
    product: Product
  }

  type User @key(selectionSet: "{ id }") {
    id: ID!
    totalReviews: Int!
    reviews: [Review]
  }

  type Product @key(selectionSet: "{ upc }") {
    upc: ID!
    reviews: [Review]
  }

  input UserKey {
    id: ID!
  }

  input ProductKey {
    upc: ID!
  }

  input ProductInput {
    keys: [ProductKey!]!
  }

  type Query {
    review(id: ID!): Review
    _users(keys: [UserKey!]!): [User]! @merge
    _products(input: ProductInput): [Product]! @merge(keyArg: "input.keys")
    _sdl: String!
  }
`;

const reviews = [
  { id: '1', authorId: '1', productUpc: '1', body: 'Love it!' },
  { id: '2', authorId: '1', productUpc: '2', body: 'Too expensive.' },
  { id: '3', authorId: '2', productUpc: '3', body: 'Could be better.' },
  { id: '4', authorId: '2', productUpc: '1', body: 'Prefer something else.' },
];

export const reviewsServer = createServer(
  createYoga({
    schema: stitchingDirectivesValidator(
      createSchema({
        typeDefs,
        resolvers: {
          Review: {
            author: review => ({ id: review.authorId }),
            product: review => ({ upc: review.productUpc }),
          },
          User: {
            reviews: user => reviews.filter(review => review.authorId === user.id),
            totalReviews: user => reviews.filter(review => review.authorId === user.id).length,
          },
          Product: {
            reviews: product => reviews.filter(review => review.productUpc === product.upc),
          },
          Query: {
            review: (_root, { id }) =>
              reviews.find(review => review.id === id) ||
              new GraphQLError('Record not found', {
                extensions: {
                  code: 'NOT_FOUND',
                },
              }),
            _users: (_root, { keys }) => keys,
            _products: (_root, { input }) => input.keys,
            _sdl: () => typeDefs,
          },
        },
      }),
    ),
  }),
);
