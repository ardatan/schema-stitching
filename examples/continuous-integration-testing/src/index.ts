import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { buildSubschemaConfigs, buildGatewaySchema } from './schema_builder';

const schema = buildGatewaySchema(buildSubschemaConfigs());

const server = createServer(createYoga({ schema }));

server.listen(4000, () => console.log('gateway running at http://localhost:4000/graphql'));
