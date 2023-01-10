import { createYoga } from "graphql-yoga";
import { createServer } from "http";
import { schema } from './schema'

const yoga = createYoga({
    schema,
});

const server = createServer(yoga);

server.listen(4002, () => console.log('storefronts  running at http://localhost:4001/graphql'));