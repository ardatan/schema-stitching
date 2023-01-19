import { inventoryServer } from './server';

inventoryServer.listen(4002, () => {
  console.log(`Inventory service running at http://localhost:4002`);
});
