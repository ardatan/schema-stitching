import { readFileSync } from 'fs';
import { createServer } from 'http';
import { join } from 'path';
import { parse } from 'graphql';
import { createYoga } from 'graphql-yoga';
import { buildSubgraphSchema } from '@apollo/subgraph';

const products = [
  {
    upc: '1',
    name: 'Table',
    price: 899,
    weight: 100,
  },
  {
    upc: '2',
    name: 'Couch',
    price: 1299,
    weight: 1000,
  },
  {
    upc: '3',
    name: 'Chair',
    price: 54,
    weight: 50,
  },
];

export const server = createServer(
  createYoga({
    schema: buildSubgraphSchema([
      {
        typeDefs: parse(readFileSync(join(__dirname, 'products.graphql'), 'utf8')),
        resolvers: {
          Product: {
            __resolveReference(object) {
              return products.find(product => product.upc === object.upc);
            },
          },
          Query: {
            topProducts(_, args) {
              return args.first ? products.slice(0, args.first) : products;
            },
          },
          Subscription: {
            newProduct: {
              async *subscribe() {
                for (const product of products) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  yield { newProduct: product };
                }
              },
            },
          },
        },
      },
    ]),
  }),
);

server.listen(4003, () => {
  console.log('products service running at http://localhost:4003/graphql');
});
