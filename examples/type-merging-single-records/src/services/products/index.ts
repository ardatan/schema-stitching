import { productsServer } from './server';

productsServer.listen(4002, () => {
  console.info('Products service listening on http://localhost:4002');
});
