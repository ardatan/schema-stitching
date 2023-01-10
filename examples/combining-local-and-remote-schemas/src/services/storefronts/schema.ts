import { makeExecutableSchema } from "@graphql-tools/schema";
import { readFileSync } from "fs";
import { join } from "path";
import { NotFoundError } from "../../lib/NotFoundError";

const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf8');

// data fixtures
const storefronts = [
    { id: '1', name: 'The Product Store' },
    { id: '2', name: 'eShoppe' },
];

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers: {
        Query: {
            storefront: (root, { id }) => storefronts.find(s => s.id === id) || new NotFoundError(),
            _sdl: () => typeDefs,
        }
    }
});