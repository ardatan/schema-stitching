import { readFileSync } from 'fs';
import { createServer } from 'http';
import { join } from 'path';
import { parse } from 'graphql';
import { createYoga } from 'graphql-yoga';
import { buildSubgraphSchema } from '@apollo/subgraph';

const users = [
  {
    id: '1',
    name: 'Ada Lovelace',
    birthDate: '1815-12-10',
    username: '@ada',
  },
  {
    id: '2',
    name: 'Alan Turing',
    birthDate: '1912-06-23',
    username: '@complete',
  },
];

export const server = createServer(
  createYoga({
    schema: buildSubgraphSchema([
      {
        typeDefs: parse(readFileSync(join(__dirname, 'accounts.graphql'), 'utf8')),
        resolvers: {
          Query: {
            me() {
              return users[0];
            },
            users() {
              return users;
            },
          },
          User: {
            __resolveReference(object: { id: string }) {
              return users.find(user => user.id === object.id);
            },
          },
        },
      },
    ]),
  }),
);

server.listen(4001, () => {
  console.log('accounts service running at http://localhost:4001/graphql');
});
