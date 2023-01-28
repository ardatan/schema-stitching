import { createServer } from 'http';
// yarn add ws
import { useServer } from 'graphql-ws/lib/use/ws';
import { createSchema } from 'graphql-yoga';
import { WebSocketServer } from 'ws';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';

export const inventoryServer = createServer();

const wsServer = new WebSocketServer({
  server: inventoryServer,
  path: '/graphql',
});

const products = [
  { id: '1', stock: 100 },
  { id: '2', stock: 200 },
];

const { stitchingDirectivesTypeDefs, stitchingDirectivesValidator } = stitchingDirectives();

const typeDefs = /* GraphQL */ `
  ${stitchingDirectivesTypeDefs}
  type Product {
    id: ID!
    stock: Int!
  }

  type Query {
    product(id: ID): Product @merge(keyField: "id", keyArg: "id")
    _sdl: String!
  }
`;

useServer(
  {
    schema: stitchingDirectivesValidator(
      createSchema({
        typeDefs,
        resolvers: {
          Query: {
            product: (_root, { id }) => products.find(product => product.id === id),
            _sdl: () => typeDefs,
          },
        },
      }),
    ),
  },
  wsServer,
);
