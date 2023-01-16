import { gatewayApp } from './gateway';
import { createServer } from 'node:http';

createServer(gatewayApp).listen(4000, () => {
  console.info('Gateway listening on http://localhost:4000');
});
