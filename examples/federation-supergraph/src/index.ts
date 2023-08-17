import { createServer } from 'http';
import { yoga } from './gateway';

const server = createServer(yoga);

server.listen(4000, () => {
  console.log('gateway running at http://localhost:4000/graphql');
});
