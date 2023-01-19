import { accountsServer } from './server';

accountsServer.listen(4001, () => {
  console.log(`Accounts service running at http://localhost:4001`);
});
