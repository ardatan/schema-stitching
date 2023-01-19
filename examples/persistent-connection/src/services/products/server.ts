import { WebSocketServer } from 'ws'; // yarn add ws
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import { createSchema } from 'graphql-yoga';
import { stitchingDirectives } from '@graphql-tools/stitching-directives';

export const productsServer = createServer();

const wsServer = new WebSocketServer({
  server: productsServer,
  path: '/graphql',
});

const products = [
  { id: '1', name: 'Product 1' },
  { id: '2', name: 'Product 2' },
];

const { stitchingDirectivesTypeDefs, stitchingDirectivesValidator } = stitchingDirectives();

const typeDefs = /* GraphQL */ `
  ${stitchingDirectivesTypeDefs}
  type Product @canonical {
    id: ID!
    name: String!
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
      })
    ),
  },
  wsServer
);
