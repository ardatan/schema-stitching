import { createSchema } from 'graphql-yoga';

const products = [
  { id: '1', title: 'Wallet' },
  { id: '2', title: 'Watch' },
  { id: '3', title: 'Hat' },
];

export const infoSchema = createSchema({
  typeDefs: /* GraphQL */ `
    type Product {
      id: ID!
      title: String
    }

    type Query {
      productsInfo(whereIn: [ID!]!): [Product]!
    }
  `,
  resolvers: {
    Query: {
      productsInfo: (root, { whereIn }) => products.filter(p => whereIn.includes(p.id)),
    },
  },
});
