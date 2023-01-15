import { server } from './server';

server.listen(4001, () => console.info('posts running at http://localhost:4001/graphql'));
