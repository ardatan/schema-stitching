import { createServer } from 'http';
import { clients, gatewayApp } from './gateway';

const server = createServer(gatewayApp);
server.listen(4000, () => console.log(`Gateway running at http://localhost:4000/graphql`));

const events = ['SIGINT', 'SIGTERM'];
events.forEach(event => {
  process.once(event, () => {
    server.close();
    clients.forEach(client => client.dispose());
  });
});
