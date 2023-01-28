import { createServer } from 'http';
import { GraphQLError } from 'graphql';
import { createSchema, createYoga } from 'graphql-yoga';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';

const { stitchingDirectivesTypeDefs, stitchingDirectivesValidator } = stitchingDirectives();

const typeDefs = /* GraphQL */ `
  ${stitchingDirectivesTypeDefs}
  "Represents a Product available for resale."
  type Product @canonical {
    "The primary key of this product."
    upc: ID!
    "The name of this product."
    name: String!
    "The price of this product in cents."
    price: Int!
    "The weight of this product in grams."
    weight: Int!
  }

  type Query {
    topProducts(first: Int = 2): [Product]!
    products(upcs: [ID!]!, order: String): [Product]!
      @merge(
        keyField: "upc"
        keyArg: "upcs"
        additionalArgs: """
        order: "price"
        """
      )
    _sdl: String!
  }
`;

const products = [
  { upc: '1', name: 'Table', price: 899, weight: 100 },
  { upc: '2', name: 'Couch', price: 1299, weight: 1000 },
  { upc: '3', name: 'Chair', price: 54, weight: 50 },
];

export const productsServer = createServer(
  createYoga({
    schema: stitchingDirectivesValidator(
      createSchema({
        typeDefs,
        resolvers: {
          Query: {
            topProducts: (_root, args) => products.slice(0, args.first),
            products: (_root, { upcs }) =>
              upcs.map(
                upc =>
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
    ),
  }),
);
