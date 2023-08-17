import { readFileSync } from 'fs';
import { createServer } from 'http';
import { inspect } from 'node:util';
import { join } from 'path';
import { parse } from 'graphql';
import { createYoga } from 'graphql-yoga';
import { buildSubgraphSchema } from '@apollo/subgraph';

const inventory = [
  { upc: '1', inStock: true },
  { upc: '2', inStock: false },
  { upc: '3', inStock: true },
];

export const server = createServer(
  createYoga({
    schema: buildSubgraphSchema([
      {
        typeDefs: parse(readFileSync(join(__dirname, 'inventory.graphql'), 'utf8')),
        resolvers: {
          Product: {
            __resolveReference(object) {
              return {
                ...object,
                ...inventory.find(product => product.upc === object.upc),
              };
            },
            shippingEstimate(object) {
              if (object.price == null || object.weight == null) {
                throw new Error(
                  `${inspect(object)} doesn't have required fields; "price" and "weight".`,
                );
              }
              // free for expensive items
              if (object.price > 1000) return 0;
              // estimate is based on weight
              return object.weight * 0.5;
            },
          },
        },
      },
    ]),
  }),
);

server.listen(4002, () => {
  console.log('inventory service running at http://localhost:4002/graphql');
});
