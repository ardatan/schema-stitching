import { inventoryServer } from './server.js';

inventoryServer.listen(4002, () => {
  console.log('Inventory ready at http://localhost:4002/graphql');
});
