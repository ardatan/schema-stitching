import { createServer } from 'http';
import { gatewayApp } from './gateway';

createServer(gatewayApp).listen(4004, () =>
  console.log(`gateway running at http://localhost:4004/graphql`),
);
