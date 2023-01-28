import { createServer } from 'http';
import { GraphQLError } from 'graphql';
import { createSchema, createYoga } from 'graphql-yoga';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';

const { stitchingDirectivesValidator, stitchingDirectivesTypeDefs } = stitchingDirectives();

const typeDefs = /* GraphQL */ `
  ${stitchingDirectivesTypeDefs}
  type Product {
    upc: ID!
    inStock: Boolean
  }

  type Query {
    mostStockedProduct: Product
    _products(upcs: [ID!]!): [Product]! @merge(keyField: "upc")
    _sdl: String!
  }
`;

const inventory = [
  { upc: '1', unitsInStock: 3 },
  { upc: '2', unitsInStock: 0 },
  { upc: '3', unitsInStock: 5 },
];

export const inventoryServer = createServer(
  createYoga({
    schema: stitchingDirectivesValidator(
      createSchema({
        typeDefs,
        resolvers: {
          Product: {
            inStock: product => product.unitsInStock > 0,
          },
          Query: {
            mostStockedProduct: () =>
              inventory.reduce(
                (acc, i) => (acc.unitsInStock >= i.unitsInStock ? acc : i),
                inventory[0],
              ),
            _products: (_root, { upcs }) =>
              upcs.map(
                (upc: string) =>
                  inventory.find(i => i.upc === upc) ||
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
