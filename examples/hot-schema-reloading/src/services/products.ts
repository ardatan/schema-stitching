import { stitchingDirectives } from '@graphql-tools/stitching-directives';
import { GraphQLError } from 'graphql';
import { createSchema, createYoga } from 'graphql-yoga';
import { createServer } from 'http';

const { stitchingDirectivesTypeDefs, stitchingDirectivesValidator } = stitchingDirectives();

const typeDefs = /* GraphQL */ `
  ${stitchingDirectivesTypeDefs}
  type Product {
    upc: ID!
    name: String!
    price: Int!
    weight: Int!
  }

  type Query {
    topProducts(first: Int = 2): [Product]!
    products(upcs: [ID!]!): [Product]! @merge(keyField: "upc")
    _sdl: String!
  }
`;
const products = [
  { upc: '1', name: 'Table', price: 899, weight: 100 },
  { upc: '2', name: 'Couch', price: 1299, weight: 1000 },
  { upc: '3', name: 'Chair', price: 54, weight: 50 },
];

createServer(
  createYoga({
    schema: stitchingDirectivesValidator(
      createSchema({
        typeDefs,
        resolvers: {
          Query: {
            topProducts: (_root, args) => products.slice(0, args.first),
            products: (_root, { upcs }) =>
              upcs.map(
                (upc: string) =>
                  products.find(product => product.upc === upc) ||
                  new GraphQLError('Record not found', {
                    extensions: {
                      code: 'NOT_FOUND',
                    },
                  })
              ),
            _sdl: () => typeDefs,
          },
        },
      })
    ),
  })
).listen(4001, () => console.log('Products server running on http://localhost:4001'));
