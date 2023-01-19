import { productsServer } from './server';

productsServer.listen(4003, () => {
  console.log(`Products service running at http://localhost:4003`);
});
