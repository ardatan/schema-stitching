import { createServer } from 'http';
import { makeGatewayApp } from './gateway';

createServer(
  makeGatewayApp({
    waitForPorts: true,
  }),
).listen(4000, () => console.log(`gateway running at http://localhost:4000/graphql`));
