import { createServer } from 'http';
import { gatewayApp } from './gateway.js';

createServer(gatewayApp).listen(4000, () => {
  console.log('Gateway ready at http://localhost:4000/graphql');
});
