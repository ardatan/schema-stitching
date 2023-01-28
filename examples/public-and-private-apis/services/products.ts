import { GraphQLError } from 'graphql';
import { createSchema } from 'graphql-yoga';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';

const { stitchingDirectivesTypeDefs, stitchingDirectivesValidator } = stitchingDirectives();

const typeDefs = /* GraphQL */ `
  ${stitchingDirectivesTypeDefs}
  "Represents a retail product."
  type Product @canonical {
    "The Univeral Product Code (UPC) of this product."
    upc: ID!
    "The name of this product."
    name: String!
    "The price of this product, in whole GBP (£)."
    price: Int!
    "The weight of this product, in grams."
    weight: Int!
  }

  type Query {
    "Fetches an array of Products by their UPC references."
    products(upcs: [ID!]!): [Product]! @merge(keyField: "upc")
    _sdl: String!
  }
`;

const products = [
  { upc: '1', name: 'Table', price: 899, weight: 100 },
  { upc: '2', name: 'Couch', price: 1299, weight: 1000 },
  { upc: '3', name: 'Chair', price: 54, weight: 50 },
];

export const productsSchema = stitchingDirectivesValidator(
  createSchema({
    typeDefs,
    resolvers: {
      Query: {
        products: (_root, { upcs }) =>
          upcs.map(
            (upc: string) =>
              products.find(product => product.upc === upc) ||
              new GraphQLError('Record not found', {
                extensions: {
                  code: 'NOT_FOUND',
                },
              }),
          ),
        _sdl: () => typeDefs,
      },
    },
  }),
);
