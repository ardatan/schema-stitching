import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { GraphQLError } from 'graphql';
import { createSchema } from 'graphql-yoga';

const { stitchingDirectivesTypeDefs, stitchingDirectivesValidator } = stitchingDirectives();

const typeDefs = /* GraphQL */ `
  ${stitchingDirectivesTypeDefs}
  "Represents a review written by a User, for a Product."
  type Review @canonical {
    "The primary key of this review."
    id: ID!
    "The review body, formatted as markdown text."
    body: String
    "The User that authored this review."
    author: User
    "The reviewed Product."
    product: Product
  }

  type User {
    id: ID!
    "Reviews written by this user."
    reviews: [Review]
  }

  type Product {
    upc: ID!
    "Reviews written about this product."
    reviews: [Review]
  }

  type Query {
    "Fetches a Review by ID reference"
    review(id: ID!, _scope: String): Review
    _users(ids: [ID!]!): [User]! @merge(keyField: "id")
    _products(upcs: [ID!]!): [Product]! @merge(keyField: "upc")
    _sdl: String!
  }
`;

const reviews = [
  { id: '1', authorId: '1', productUpc: '1', body: 'Love it!' },
  { id: '2', authorId: '1', productUpc: '2', body: 'Too expensive.' },
  { id: '3', authorId: '2', productUpc: '3', body: 'Could be better.' },
  { id: '4', authorId: '2', productUpc: '1', body: 'Prefer something else.' },
];

export const reviewsSchema = stitchingDirectivesValidator(
  createSchema({
    typeDefs,

    resolvers: {
      Review: {
        author: review => ({ id: review.authorId }),
        product: review => ({ upc: review.productUpc }),
      },
      User: {
        reviews: user => reviews.filter(review => review.authorId === user.id),
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
        _users: (_root, { ids }) => ids.map((id: string) => ({ id })),
        _products: (_root, { upcs }) => upcs.map((upc: string) => ({ upc })),
        _sdl: () => typeDefs,
      },
    },
  })
);
