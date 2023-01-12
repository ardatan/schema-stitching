import { server } from './server';

server.listen(4002, () => console.info('users running at http://localhost:4002/graphql'));
