import { makeExecutableSchema } from "@graphql-tools/schema";
import { readFileSync } from "fs";
import { join } from "path";
import { NotFoundError } from '../../lib/NotFoundError';

const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf8');

// data fixtures
const products = [
    { upc: '1', name: 'Cookbook', price: 15.99 },
    { upc: '2', name: 'Toothbrush', price: 3.99 },
];

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers: {
        Query: {
            product: (root, { upc }) => products.find(p => p.upc === upc) || new NotFoundError()
        }
    }
});