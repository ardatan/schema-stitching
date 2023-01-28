import { createServer } from 'node:http';
import { gatewayApp } from './gateway';

createServer(gatewayApp).listen(4000, () => {
  console.info('Gateway listening on http://localhost:4000');
});
