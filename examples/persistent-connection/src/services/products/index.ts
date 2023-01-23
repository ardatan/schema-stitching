import { productsServer } from './server';

productsServer.listen(4001, () => {
  console.log(`Products service running at http://localhost:4001`);
});
